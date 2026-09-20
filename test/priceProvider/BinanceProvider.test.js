import { describe, test, expect } from '@jest/globals';
import { BinanceProvider } from "../../src/priceProvider/BinanceProvider.js";

/**
 * Test Suite for the Binance Provider class.
 */
describe("BinanceProviderTests", () => {
    // Common test constants.
    const cUrl = "https://api.binance.com/api/v3/ticker/bookTicker";
    const cTicker = "BTCUSDT";

    /**
     * Tests that buildUrl appends the symbol as a query parameter.
     */
    test("BinanceProvider buildUrl appends the symbol as a query parameter", () => {
        var provider = new BinanceProvider(cUrl);

        expect(provider.buildUrl(cTicker)).toEqual(cUrl + "?symbol=" + cTicker);
    });

    /**
     * Tests that buildUrl falls back to the default Binance url when none is provided.
     */
    test("BinanceProvider buildUrl uses the default url when none is provided", () => {
        var provider = new BinanceProvider();

        expect(provider.buildUrl(cTicker)).toEqual(BinanceProvider.cDefaultUrl + "?symbol=" + cTicker);
    });

    /**
     * Tests that extractPrice reads the askPrice field and converts the JSON string to a number.
     */
    test("BinanceProvider extractPrice reads and converts the askPrice field", () => {
        var provider = new BinanceProvider(cUrl);

        expect(provider.extractPrice({ symbol: cTicker, bidPrice: "99.00", askPrice: "100.00" })).toEqual(100.00);
    });

    /**
     * Tests that extractPrice throws when the askPrice field is missing.
     */
    test("BinanceProvider extractPrice throws when the askPrice field is missing", () => {
        var provider = new BinanceProvider(cUrl);

        expect(() => provider.extractPrice({ symbol: cTicker, bidPrice: "99.00" })).toThrow(
            "Binance response is missing a valid ask price.");
    });
});
