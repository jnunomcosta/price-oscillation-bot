import { PriceAnalyzer } from "./PriceAnalyzer.js";

/**
 * The Analyze Manager class. It's responsible for storing the
 * Price Analyzer instances and dispatching the new price 
 * analysis to the right Price Analyzer.
 */
export class AnalyzeManager {
    // {map}
    #mPriceAnalyzers
    // {function}
    #mAlertCallback

    /**
     * Analyze Manager class constructor.
     * 
     * @param {function} pAlertCallback 
     *      The alert callback that will be called by the 
     *      various price analyzers. This callback is expected to have
     *      the following signature: function (number arg) : void.
     */
    constructor(pAlertCallback) {
        this.#mPriceAnalyzers = new Map();
        this.#mAlertCallback = pAlertCallback;
    }

    /**
     * Creates a new price analyzer instances based on the 
     * currency pair and price variance threshold provided.
     * 
     * @param {string} pCurrencyPair 
     *      The currency pair string.
     * @param {number} pPriceVarianceThreshold 
     *      The price variance threshold value.
     */
    addCurrencyPairToAnalyze(pCurrencyPair, pPriceVarianceThreshold) {
        this.#mPriceAnalyzers.set(
            pCurrencyPair,
            new PriceAnalyzer(pCurrencyPair, pPriceVarianceThreshold, this.#mAlertCallback));
    }

    /**
     * Analyzes a price currency and price pair for price variations
     * based on the provided price variance threshold.
     * 
     * @param {string} pCurrencyPair 
     *      The currency pair string.
     * @param {number} pNewPrice 
     *      The new currency price.
     */
    analyzePrice(pCurrencyPair, pNewPrice) {
        var analyzer = this.#mPriceAnalyzers.get(pCurrencyPair);
        if (analyzer != undefined) {
            analyzer.analyze(pNewPrice);
        }
    }
}
