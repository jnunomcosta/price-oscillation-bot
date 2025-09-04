import { AnalyzeManager } from "./analyzer/AnalyzeManager.js";
import { FetchData } from "./backendConnection/FetchData.js";
import { EngineManager } from "./engine/EngineManager.js";

/**
 * Helper method that wraps around the toFixed method to
 * round a number up to a certain number of decimal places.
 * 
 * @param {number} pNum 
 * 		The number to round up.
 * @param {number} pDecimalPlaces 
 * 		The number of decimal places to round to.
 * @returns 
 * 		The rounded up number.
 */
function roundToN(pNum, pDecimalPlaces) {
	return +pNum.toFixed(pDecimalPlaces);
}

/**
 * Main function, responsible for holding the execution constants,
 * instantiating the necessary classes and callbacks and orchestrating
 * the execution.
 */
async function main() {
	/**
	 * Constants: 
	 * 		- Uphold Url to connect to; 
	 * 		- The currency pair ticker to track;
	 * 		- The frequency in each the engine works; 
	 * 		- The price variance threshold of which a price alert will trigger.
	 */
	const cUpholdUrl = "https://api.uphold.com/v0/ticker/";
	const cTickerToTrack = "BTC-USD";
	const cEngineFrequency = 5000;
	const cPriceVarianceThreshold = 0.01 / 100;

	// Create the fetch data object with the uphold url.
	var fetchData = new FetchData(cUpholdUrl);

	// Create the alert callback that will be called after the variance threshold
	// is reached. Currently this callback logs everything it receives from the 
	// alert.
	var alertCallback = (price) => {
		console.log("New Price Alert 🚨 on " + price.getCurrencyPair() +
			"! Price at: " + price.getCurrentPrice() + "$" +
			", variation of " + roundToN(price.getVariation() * 100, 4) + "%" +
			" previous alert price: " + price.getPreviousAlertPrice() + "$" +
			" with timestamp: " + price.getTimestamp());
	};

	// Create the analyze manager and pass to it the ticker and price variance we
	// want to analyze.
	var analyzeManager = new AnalyzeManager(alertCallback);
	analyzeManager.addCurrencyPairToAnalyze(cTickerToTrack, cPriceVarianceThreshold);

	// Create the engine operation callback. This function calls fetchData
	// to get the latest price from Uphold API and after it resolves the
	// call it passes the data to the analyze manager for analysis. In
	// case of error, a log is performed and no analysis is made.
	var engineOperationCallback = (ticker) => {
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

	// Ask engine manager to create a new engine based on the ticker and frequency
	// we desire. Finally we start all engines and they start fetching data.
	engineManager.createEngine(cTickerToTrack, cEngineFrequency, cTickerToTrack);
	engineManager.startEngines();

	// Create a shutdown callback to gracefully stop the executing engines.
	var shutdownCallback = () => {
		console.log("\nShutting down bot...");
		engineManager.stopEngines();
		console.log("Engines shutdown successfully.");
		process.exit(0);
	};

	// Catch the SIGINT and SIGTERM signals and pass them the shutdown callback.
	process.on("SIGINT", shutdownCallback);
	process.on("SIGTERM", shutdownCallback);
}

// Execute main and catch potential errors.
main().catch((error) => {
	console.error("Fatal error: ", error);
	process.exit(1);
});

