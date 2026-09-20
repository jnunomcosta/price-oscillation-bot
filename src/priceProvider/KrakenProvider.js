/**
 * Price Provider for the Kraken exchange. Knows how to turn a ticker
 * into a Kraken ticker Url and how to dig the ask price out of a
 * Kraken ticker response body.
 *
 * Kraken has three quirks that the other providers do not: the symbol
 * is passed as a query parameter, the response key that comes back is
 * not the requested symbol (e.g. "XBTUSD" comes back under "XXBTZUSD"),
 * and a rejected symbol is reported as an HTTP 200 with a populated
 * "error" array rather than as a failed status code.
 */
export class KrakenProvider {
    // {string}
    static cDefaultUrl = "https://api.kraken.com/0/public/Ticker"

    // {string}
    #mUrl

    /**
     * Kraken Provider class constructor.
     *
     * @param {string} pUrl
     *      An optional base url to override the provider's default endpoint.
     */
    constructor(pUrl = KrakenProvider.cDefaultUrl) {
        this.#mUrl = pUrl;
    }

    /**
     * Builds the full ticker Url for the given ticker.
     *
     * @param {string} pTicker
     *      The ticker to fetch, e.g. "XBTUSD".
     * @returns {string}
     *      The full ticker Url.
     */
    buildUrl(pTicker) {
        return this.#mUrl + "?pair=" + pTicker;
    }

    /**
     * Extracts the ask price from a Kraken ticker response body.
     *
     * @param {object} pResponseBody
     *      The parsed Kraken ticker response body.
     * @returns {number}
     *      The ask price.
     */
    extractPrice(pResponseBody) {
        // A non-empty error array means the requested symbol was rejected,
        // even though the HTTP status code was a success.
        if (pResponseBody.error != undefined && pResponseBody.error.length > 0) {
            throw new Error("Kraken response reported an error: " + pResponseBody.error.join(", "));
        }

        // The response key is not the requested symbol, so the first (and
        // only) key of the result object is read instead.
        var resultKeys = Object.keys(pResponseBody.result || {});
        if (resultKeys.length == 0) {
            throw new Error("Kraken response is missing a result entry.");
        }

        var askArray = pResponseBody.result[resultKeys[0]].a;
        if (askArray == undefined || askArray[0] == undefined) {
            throw new Error("Kraken response is missing a valid ask price.");
        }

        // Kraken returns prices as JSON strings, so they are converted to numbers.
        var price = Number(askArray[0]);
        if (isNaN(price)) {
            throw new Error("Kraken response is missing a valid ask price.");
        }

        return price;
    }
}
