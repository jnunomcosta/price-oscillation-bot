import { describe, test, expect } from '@jest/globals';
import { CoinbaseProvider } from "../../src/priceProvider/CoinbaseProvider.js";

/**
 * Test Suite for the Coinbase Provider class.
 */
describe("CoinbaseProviderTests", () => {
    // Common test constants.
    const cUrl = "https://api.exchange.coinbase.com/";
    const cTicker = "BTC-USD";

    /**
     * Tests that buildUrl builds the products/<ticker>/ticker path.
     */
    test("CoinbaseProvider buildUrl builds the products ticker path", () => {
        var provider = new CoinbaseProvider(cUrl);

        expect(provider.buildUrl(cTicker)).toEqual(cUrl + "products/" + cTicker + "/ticker");
    });

    /**
     * Tests that buildUrl falls back to the default Coinbase url when none is provided.
     */
    test("CoinbaseProvider buildUrl uses the default url when none is provided", () => {
        var provider = new CoinbaseProvider();

        expect(provider.buildUrl(cTicker)).toEqual(CoinbaseProvider.cDefaultUrl + "products/" + cTicker + "/ticker");
    });

    /**
     * Tests that extractPrice reads the ask field and converts the JSON string to a number.
     */
    test("CoinbaseProvider extractPrice reads and converts the ask field", () => {
        var provider = new CoinbaseProvider(cUrl);

        expect(provider.extractPrice({ ask: "123.45", bid: "100.00" })).toEqual(123.45);
    });

    /**
     * Tests that extractPrice throws when the ask field is missing.
     */
    test("CoinbaseProvider extractPrice throws when the ask field is missing", () => {
        var provider = new CoinbaseProvider(cUrl);

        expect(() => provider.extractPrice({ bid: "100.00" })).toThrow(
            "Coinbase response is missing a valid ask price.");
    });
});
