/**
 * Price Alert class that holds the output of a generated price alert.
 */
export class PriceAlert {
    // {string}
    #mCurrencyPair
    // {number}
    #mTimestamp
    // {number}
    #mVariation
    // {number}
    #mPreviousAlertPrice
    // {number}
    #mCurrentPrice

    /**
     * Price Alert class constructor.
     * 
     * @param {string} pCurrencyPair
     *      The currency pair that triggered the price alert.
     * @param {number} pTimestamp 
     *      The timestamp of when the alert was generated.
     * @param {number} pVariation 
     *      The price variation that caused the alert.
     * @param {number} pPreviousAlertPrice 
     *      The previous alert price.
     * @param {number} pCurrentPrice 
     *      The new price that caused the alert.
     */
    constructor(pCurrencyPair, pTimestamp, pVariation, pPreviousAlertPrice, pCurrentPrice) {
        this.#mCurrencyPair = pCurrencyPair;
        this.#mTimestamp = pTimestamp;
        this.#mVariation = pVariation;
        this.#mPreviousAlertPrice = pPreviousAlertPrice;
        this.#mCurrentPrice = pCurrentPrice;
    }

    /**
     * Getter for the currency pair string.
     * @returns 
     *      The currency pair string.
     */
    getCurrencyPair() {
        return this.#mCurrencyPair;
    }

    /**
     * Getter for the timestamp value.
     * @returns 
     *      The timestamp value.
     */
    getTimestamp() {
        return this.#mTimestamp;
    }

    /**
     * Getter for the variation value.
     * @returns 
     *      The variation value.
     */
    getVariation() {
        return this.#mVariation;
    }

    /**
     * Getter for the previous alert price value.
     * @returns 
     *      The previous alert price value.
     */
    getPreviousAlertPrice() {
        return this.#mPreviousAlertPrice;
    }

    /**
     * Getter for the current price value.
     * @returns 
     *      The current price value.
     */
    getCurrentPrice() {
        return this.#mCurrentPrice;
    }
}
