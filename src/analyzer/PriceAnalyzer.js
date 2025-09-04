import { PriceAlert } from "./PriceAlert.js";

/**
 * The PriceAnalyzer class. It's responsible for analyzing all new
 * received prices and providing alerts in case of a price oscillation.
 */
export class PriceAnalyzer {
    // {string}
    #mCurrencyPair
    // {number}
    #mVariationThreshold
    // {number}
    #mLastPriceAlert
    // {function}
    #mAlertCallback

    /**
     * PriceAnalyzer class constructor.
     * 
     * @param {string} pCurrencyPair 
     *      The currency pair to analyze. 
     * @param {number} pVariationThreshold 
     *      The variation threshold necessary for an alert.
     * @param {function} pAlertCallback
     *      The callback that the analyzer calls when a new alert is triggered.
     * @param {number} pLastPriceAlert
     *      An optional Last Price Alert value to be initialized with. If not 
     *      present it will take the value "null" and be populated on the first 
     *      analysis.
     */
    constructor(pCurrencyPair, pVariationThreshold, pAlertCallback, pLastPriceAlert = null) {
        this.#mCurrencyPair = pCurrencyPair;
        this.#mVariationThreshold = pVariationThreshold;
        this.#mLastPriceAlert = pLastPriceAlert;
        this.#mAlertCallback = pAlertCallback;
    }

    /**
     * Analyze method, that is called to compare if the provided new price when
     * compared to an old price triggers a variation higher that the threshold
     * allows, if so, the alert callback is called and a new alert emitted.
     * 
     * @param {number} pNewPrice 
     *      The new price value.
     */
    analyze(pNewPrice) {
        // Checks if the last price alert has any value, if not the
        // last price alert becomes the new price and nothing is done.
        if (this.#mLastPriceAlert == null) {
            this.#mLastPriceAlert = pNewPrice;
            return;
        }

        // Calculates the variation value.
        var variationValue = (pNewPrice - this.#mLastPriceAlert) / this.#mLastPriceAlert;

        // Checks if the variation value triggers the threshold.
        if (Math.abs(variationValue) > this.#mVariationThreshold) {
            // Creates a new Price Alert object and calls the alert callback with it.
            var priceAlert = new PriceAlert(
                this.#mCurrencyPair, Date.now(), variationValue, this.#mLastPriceAlert, pNewPrice);
            this.#mAlertCallback(priceAlert);

            // Updates the value of the last price alert as the new price.
            this.#mLastPriceAlert = pNewPrice;
        }
    }
}
