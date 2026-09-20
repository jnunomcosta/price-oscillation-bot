/**
 * Price Provider for the Binance exchange. Knows how to turn a ticker
 * into a Binance bookTicker Url and how to dig the ask price out of a
 * Binance bookTicker response body.
 *
 * This uses the bookTicker endpoint, not ticker/price, because the
 * latter has no ask/bid and would break the "the analyzed number is
 * always the ask" invariant.
 */
export class BinanceProvider {
    // {string}
    static cDefaultUrl = "https://api.binance.com/api/v3/ticker/bookTicker"

    // {string}
    #mUrl

    /**
     * Binance Provider class constructor.
     *
     * @param {string} pUrl
     *      An optional base url to override the provider's default endpoint.
     */
    constructor(pUrl = BinanceProvider.cDefaultUrl) {
        this.#mUrl = pUrl;
    }

    /**
     * Builds the full ticker Url for the given ticker.
     *
     * @param {string} pTicker
     *      The ticker to fetch, e.g. "BTCUSDT".
     * @returns {string}
     *      The full ticker Url.
     */
    buildUrl(pTicker) {
        return this.#mUrl + "?symbol=" + pTicker;
    }

    /**
     * Extracts the ask price from a Binance bookTicker response body.
     *
     * @param {object} pResponseBody
     *      The parsed Binance bookTicker response body.
     * @returns {number}
     *      The ask price.
     */
    extractPrice(pResponseBody) {
        // Binance returns prices as JSON strings, so they are converted to numbers.
        var price = Number(pResponseBody.askPrice);
        if (isNaN(price)) {
            throw new Error("Binance response is missing a valid ask price.");
        }

        return price;
    }
}
