import { AnalyzeManager } from "../analyzer/AnalyzeManager.js";
import { FetchData } from "../backendConnection/FetchData.js";
import { EngineManager } from "../engine/EngineManager.js";
import { parseArguments } from "../argumentParser/ArgumentParser.js"
import { loadConfig } from "../configLoader/ConfigLoader.js"

// Define the command line argument options.
const cArgumentOptions = [{ flags: '-c, --config <path>', description: 'Path to config file' }];

// Define the JSON schema for the config file.
/**
 * TODO: This schema can be expanded in the future to include more
 * configuration options.
 * For example, alert type, database connection configuration,
 * engine execution type, url for each currency pair, etc.
 */
const cConfigSchema = {
    type: "object",
    properties: {
        url: { type: "string" },		   				   	   	   // URL to connect to e.g., "https://api.uphold.com/v0/ticker/".
        currenciesToTrack: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    currencyPairTicker: { type: "string" },		   // e.g., "BTC-USD".
                    fetchInterval: { type: "number" }, 			   // in milliseconds (ms).
                    priceOscillationPercentage: { type: "number" } // in percentage (%).
                },
                required: ["currencyPairTicker", "fetchInterval", "priceOscillationPercentage"],
                additionalProperties: false
            },
        }
    },
    required: ["url", "currenciesToTrack"],
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

    // If no currencies were provided to track, log the error and exit.
    if (configObject.currenciesToTrack.length == 0) {
        console.log("Empty configuration provided. Exiting...");
        process.exit(1);
    }

    // Create the fetch data object with the configuration url.
    var fetchData = new FetchData(configObject.url);

    // Create the analyze manager and pass to it the ticker and price variance we
    // want to analyze.
    var analyzeManager = new AnalyzeManager(priceAlert);

    // Create the engine operation callback. This function calls fetchData
    // to get the latest price from Uphold API and after it resolves the
    // call it passes the data to the analyze manager for analysis. In
    // case of error, a log is performed and no analysis is made.
    var engineOperationCallback = (ticker) => {
        /**
         * TODO: The fetchData function can be modified to recieve the 
         * url and ticker as parameters, so that we can have more than
         * one Url connection via configuration.
         */
        fetchData.fetchData(ticker)
            .then(
                response => {
                    analyzeManager.analyzePrice(ticker, response.ask);
                },
                error => {
                    console.log("Error on HTTP Get operation for ticker " + ticker + " - " + error);
                    return;
                });
    };

    // Create the engine manager with the engine operation callback.
    var engineManager = new EngineManager(engineOperationCallback);

    // Iterate over the configuration currencies to analyze and initialize their
    // respective engine and analysis.
    configObject.currenciesToTrack.forEach(currencyConfig => {
        engineManager.createEngine(currencyConfig.currencyPairTicker, currencyConfig.fetchInterval, currencyConfig.currencyPairTicker);
        analyzeManager.addCurrencyPairToAnalyze(currencyConfig.currencyPairTicker, currencyConfig.priceOscillationPercentage / 100);
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
