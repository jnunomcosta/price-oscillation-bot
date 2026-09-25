/**
 * Price Provider for the Coinbase exchange. Knows how to turn a ticker
 * into a Coinbase Exchange ticker Url and how to dig the ask price out
 * of a Coinbase Exchange ticker response body.
 *
 * This uses the Coinbase Exchange API (products/<ticker>/ticker), not
 * the v2 spot price endpoint, which returns a single amount with no
 * ask/bid and would break the "the analyzed number is always the ask"
 * invariant.
 */
export class CoinbaseProvider {
    // {string}
    static cDefaultUrl = "https://api.exchange.coinbase.com/"

    // {string}
    #mUrl

    /**
     * Coinbase Provider class constructor.
     *
     * @param {string} pUrl
     *      An optional base url to override the provider's default endpoint.
     */
    constructor(pUrl = CoinbaseProvider.cDefaultUrl) {
        this.#mUrl = pUrl;
    }

    /**
     * Builds the full ticker Url for the given ticker.
     *
     * @param {string} pTicker
     *      The ticker to fetch, e.g. "BTC-USD".
     * @returns {string}
     *      The full ticker Url.
     */
    buildUrl(pTicker) {
        return this.#mUrl + "products/" + pTicker + "/ticker";
    }

    /**
     * Extracts the ask price from a Coinbase Exchange ticker response body.
     *
     * @param {object} pResponseBody
     *      The parsed Coinbase Exchange ticker response body.
     * @returns {number}
     *      The ask price.
     */
    extractPrice(pResponseBody) {
        // Coinbase returns price fields as JSON strings, so they are
        // converted to numbers.
        var price = Number(pResponseBody.ask);
        if (isNaN(price)) {
            throw new Error("Coinbase response is missing a valid ask price.");
        }

        return price;
    }
}
