/**
 * Price Provider for the Uphold exchange. Knows how to turn a ticker
 * into an Uphold ticker Url and how to dig the ask price out of an
 * Uphold ticker response body.
 */
export class UpholdProvider {
    // {string}
    static cDefaultUrl = "https://api.uphold.com/v0/ticker/"

    // {string}
    #mUrl

    /**
     * Uphold Provider class constructor.
     *
     * @param {string} pUrl
     *      An optional base url to override the provider's default endpoint.
     */
    constructor(pUrl = UpholdProvider.cDefaultUrl) {
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
        return this.#mUrl + pTicker;
    }

    /**
     * Extracts the ask price from an Uphold ticker response body.
     *
     * @param {object} pResponseBody
     *      The parsed Uphold ticker response body.
     * @returns {number}
     *      The ask price.
     */
    extractPrice(pResponseBody) {
        // Convert the ask field to a number, so both numeric and string
        // responses are handled uniformly.
        var price = Number(pResponseBody.ask);
        if (isNaN(price)) {
            throw new Error("Uphold response is missing a valid ask price.");
        }

        return price;
    }
}
