import { AnalyzeManager } from "../analyzer/AnalyzeManager.js";
import { FetchData } from "../backendConnection/FetchData.js";
import { EngineManager } from "../engine/EngineManager.js";
import { parseArguments } from "../argumentParser/ArgumentParser.js"
import { loadConfig } from "../configLoader/ConfigLoader.js"
import { PriceProviderFactory } from "../priceProvider/PriceProviderFactory.js"

// Define the command line argument options.
const cArgumentOptions = [{ flags: '-c, --config <path>', description: 'Path to config file' }];

// Define the JSON schema for the config file.
/**
 * TODO: This schema can be expanded in the future to include more
 * configuration options.
 * For example, alert type, database connection configuration,
 * engine execution type, etc.
 */
const cConfigSchema = {
    type: "object",
    properties: {
        providers: {
            type: "object",
            additionalProperties: {
                type: "object",
                properties: {
                    type: { type: "string", enum: ["uphold", "coinbase", "kraken", "binance"] }, // Implemented provider type.
                    url: { type: "string" }		   				   	   	   // Optional url override, e.g., "https://api.uphold.com/v0/ticker/".
                },
                required: ["type"],
                additionalProperties: false
            }
        },
        currenciesToTrack: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    provider: { type: "string" },		   			   // Name of an entry in "providers".
                    currencyPairTicker: { type: "string" },		   // e.g., "BTC-USD".
                    fetchInterval: { type: "number" }, 			   // in milliseconds (ms).
                    priceOscillationPercentage: { type: "number" } // in percentage (%).
                },
                required: ["provider", "currencyPairTicker", "fetchInterval", "priceOscillationPercentage"],
                additionalProperties: false
            },
        }
    },
    required: ["providers", "currenciesToTrack"],
    additionalProperties: false
};

/**
 * The price alert function that will trigger when a price alert is detected
 * for a specific currency pair.
 *
 * @param {PriceAlert} pPrice
 * 		The price alert object with all of the price information.
 *
 * TODO: This function can be modified to connect to a database and store
 * the price alert information there.
 */
export function priceAlert(pPrice) {
    console.log("New Price Alert 🚨 on " + pPrice.getCurrencyPair() +
        "! Price at: " + pPrice.getCurrentPrice() +
        ", variation of " + +(pPrice.getVariation() * 100).toFixed(4) + "%" +
        " previous alert price: " + pPrice.getPreviousAlertPrice() +
        " with timestamp: " + pPrice.getTimestamp());
}

/**
 * Validates that every tracked currency references a provider present in the
 * registry, and that no provider/ticker combination is tracked twice. Logs
 * and exits the process on the first violation found.
 *
 * @param {object} pConfigObject
 * 		The loaded and schema-validated config object.
 * @returns {boolean}
 * 		True if the config is valid, false if a violation was found (in
 * 		which case process.exit was also called).
 */
function validateCurrenciesToTrack(pConfigObject) {
    // Track the provider/ticker combinations already seen, so a duplicate
    // does not silently overwrite an earlier engine.
    var seenCompositeKeys = new Set();

    // Find() short-circuits on the first violation, unlike forEach(), so a
    // single bad entry cannot be followed by further setup even when
    // process.exit does not immediately halt execution (as when it is
    // mocked in tests).
    var invalidEntry = pConfigObject.currenciesToTrack.find(currencyConfig => {
        // Check that the referenced provider name exists in the registry.
        if (!Object.hasOwn(pConfigObject.providers, currencyConfig.provider)) {
            return true;
        }

        // Check that this provider/ticker combination has not already been tracked.
        var compositeKey = currencyConfig.provider + ":" + currencyConfig.currencyPairTicker;
        if (seenCompositeKeys.has(compositeKey)) {
            return true;
        }
        seenCompositeKeys.add(compositeKey);
        return false;
    });

    // If no violation was found, the config is valid.
    if (invalidEntry == undefined) {
        return true;
    }

    // Report the specific violation that was found.
    if (!Object.hasOwn(pConfigObject.providers, invalidEntry.provider)) {
        console.error("Unknown provider '" + invalidEntry.provider + "' referenced by ticker '" +
            invalidEntry.currencyPairTicker + "'. Exiting...");
    } else {
        console.error("Duplicate provider/ticker combination '" + invalidEntry.provider + ":" +
            invalidEntry.currencyPairTicker + "'. Exiting...");
    }
    process.exit(1);
    return false;
}

/**
 * Run Bot function, responsible for holding the execution constants,
 * instantiating the necessary classes and callbacks and orchestrating
 * the execution.
 */
export async function runBot() {
    // Parse the command line arguments to get the config file path.
    const userArguments = parseArguments(process.argv, cArgumentOptions);

    // Load and validate the config file. If an error occurs, log it and exit.
    const configObject = await loadConfig(userArguments.config, cConfigSchema)
        .catch((err) => {
            // In case the promise rejects, log the error and exit.
            console.error(err);
            process.exit(1);
        });

    // Guard the remaining setup in case process.exit was mocked (as in tests)
    // and therefore did not actually terminate the process above.
    if (configObject == undefined) {
        return;
    }

    // If no currencies were provided to track, log the error and exit.
    if (configObject.currenciesToTrack.length == 0) {
        console.log("Empty configuration provided. Exiting...");
        process.exit(1);
    }

    // Validate that every currency entry references a known provider and that
    // no provider/ticker combination is tracked more than once. Guard the
    // remaining setup in case process.exit was mocked (as in tests) and
    // therefore did not actually terminate the process above.
    if (!validateCurrenciesToTrack(configObject)) {
        return;
    }

    // Create the fetch data object, shared by every provider.
    var fetchData = new FetchData();

    // Create one Price Provider instance per registry entry, keyed by its
    // config name.
    var priceProviders = new Map();
    Object.entries(configObject.providers).forEach(([providerName, providerConfig]) => {
        priceProviders.set(providerName, PriceProviderFactory.createProvider(providerConfig.type, providerConfig.url));
    });

    // Create the analyze manager and pass to it the ticker and price variance we
    // want to analyze.
    var analyzeManager = new AnalyzeManager(priceAlert);

    // Create the engine operation callback. This function calls fetchData
    // to get the latest price from the resolved price provider's Url and
    // after it resolves extracts the price and passes it to the analyze
    // manager for analysis. In case of a fetch or extraction error, a log
    // is performed, identifying both the provider and the ticker, and no
    // analysis is made.
    var engineOperationCallback = (pEngineParameter) => {
        var priceProvider = priceProviders.get(pEngineParameter.provider);
        fetchData.fetchData(priceProvider.buildUrl(pEngineParameter.ticker))
            .then(
                response => {
                    try {
                        analyzeManager.analyzePrice(pEngineParameter.compositeKey, priceProvider.extractPrice(response));
                    } catch (error) {
                        console.log("Error extracting price for provider " + pEngineParameter.provider +
                            " and ticker " + pEngineParameter.ticker + " - " + error.message);
                    }
                },
                error => {
                    console.log("Error on HTTP Get operation for provider " + pEngineParameter.provider +
                        " and ticker " + pEngineParameter.ticker + " - " + error);
                    return;
                });
    };

    // Create the engine manager with the engine operation callback.
    var engineManager = new EngineManager(engineOperationCallback);

    // Iterate over the configuration currencies to analyze and initialize their
    // respective engine and analysis. Engines and analyzers are keyed by the
    // composite "provider:ticker" key, so the same ticker can be tracked on
    // more than one provider in the same process.
    configObject.currenciesToTrack.forEach(currencyConfig => {
        var compositeKey = currencyConfig.provider + ":" + currencyConfig.currencyPairTicker;
        engineManager.createEngine(compositeKey, currencyConfig.fetchInterval, {
            provider: currencyConfig.provider,
            ticker: currencyConfig.currencyPairTicker,
            compositeKey: compositeKey
        });
        analyzeManager.addCurrencyPairToAnalyze(compositeKey, currencyConfig.priceOscillationPercentage / 100);
    });

    // Start all of the created engines.
    engineManager.startEngines();

    // Create a shutdown callback to gracefully stop the executing engines.
    var shutdownCallback = () => {
        console.log("\nShutting down bot...");
        engineManager.stopEngines();
        console.log("Engines were shut down successfully.");
        process.exit(0);
    };

    // Catch the SIGINT and SIGTERM signals and pass them the shutdown callback.
    process.on("SIGINT", shutdownCallback);
    process.on("SIGTERM", shutdownCallback);
}
