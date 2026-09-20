import { describe, test, expect } from '@jest/globals';
import { KrakenProvider } from "../../src/priceProvider/KrakenProvider.js";

/**
 * Test Suite for the Kraken Provider class.
 */
describe("KrakenProviderTests", () => {
    // Common test constants.
    const cUrl = "https://api.kraken.com/0/public/Ticker";
    const cTicker = "XBTUSD";

    /**
     * Tests that buildUrl appends the pair as a query parameter.
     */
    test("KrakenProvider buildUrl appends the pair as a query parameter", () => {
        var provider = new KrakenProvider(cUrl);

        expect(provider.buildUrl(cTicker)).toEqual(cUrl + "?pair=" + cTicker);
    });

    /**
     * Tests that buildUrl falls back to the default Kraken url when none is provided.
     */
    test("KrakenProvider buildUrl uses the default url when none is provided", () => {
        var provider = new KrakenProvider();

        expect(provider.buildUrl(cTicker)).toEqual(KrakenProvider.cDefaultUrl + "?pair=" + cTicker);
    });

    /**
     * Tests that extractPrice reads the ask price from the first (and only)
     * result key, even though that key differs from the requested pair, and
     * converts the JSON string price to a number.
     */
    test("KrakenProvider extractPrice reads the ask price from the first result key", () => {
        var provider = new KrakenProvider(cUrl);

        const responseBody = {
            error: [],
            result: {
                XXBTZUSD: { a: ["100.5", "1", "1.000"] }
            }
        };

        expect(provider.extractPrice(responseBody)).toEqual(100.5);
    });

    /**
     * Tests that extractPrice throws when the response contains a non-empty
     * error array, even though the HTTP status code would have been a success.
     */
    test("KrakenProvider extractPrice throws when the response has errors", () => {
        var provider = new KrakenProvider(cUrl);

        const responseBody = { error: ["EQuery:Unknown asset pair"], result: {} };

        expect(() => provider.extractPrice(responseBody)).toThrow(
            "Kraken response reported an error: EQuery:Unknown asset pair");
    });

    /**
     * Tests that extractPrice throws when the result object has no entries.
     */
    test("KrakenProvider extractPrice throws when the result is empty", () => {
        var provider = new KrakenProvider(cUrl);

        expect(() => provider.extractPrice({ error: [], result: {} })).toThrow(
            "Kraken response is missing a result entry.");
    });

    /**
     * Tests that extractPrice throws when the ask array is missing.
     */
    test("KrakenProvider extractPrice throws when the ask array is missing", () => {
        var provider = new KrakenProvider(cUrl);

        const responseBody = { error: [], result: { XXBTZUSD: {} } };

        expect(() => provider.extractPrice(responseBody)).toThrow(
            "Kraken response is missing a valid ask price.");
    });
});
