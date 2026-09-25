import { describe, test, expect } from '@jest/globals';
import { UpholdProvider } from "../../src/priceProvider/UpholdProvider.js";

/**
 * Test Suite for the Uphold Provider class.
 */
describe("UpholdProviderTests", () => {
    // Common test constants.
    const cUrl = "https://api.uphold.com/v0/ticker/";
    const cTicker = "BTC-USD";

    /**
     * Tests that buildUrl concatenates the base url and the ticker.
     */
    test("UpholdProvider buildUrl concatenates the base url and ticker", () => {
        var provider = new UpholdProvider(cUrl);

        expect(provider.buildUrl(cTicker)).toEqual(cUrl + cTicker);
    });

    /**
     * Tests that buildUrl falls back to the default Uphold url when none is provided.
     */
    test("UpholdProvider buildUrl uses the default url when none is provided", () => {
        var provider = new UpholdProvider();

        expect(provider.buildUrl(cTicker)).toEqual(UpholdProvider.cDefaultUrl + cTicker);
    });

    /**
     * Tests that extractPrice reads the ask field from the response body.
     */
    test("UpholdProvider extractPrice reads the ask field", () => {
        var provider = new UpholdProvider(cUrl);

        expect(provider.extractPrice({ ask: 123.45, bid: 100, currency: "USD" })).toEqual(123.45);
    });

    /**
     * Tests that extractPrice throws when the ask field is missing.
     */
    test("UpholdProvider extractPrice throws when the ask field is missing", () => {
        var provider = new UpholdProvider(cUrl);

        expect(() => provider.extractPrice({ bid: 100, currency: "USD" })).toThrow(
            "Uphold response is missing a valid ask price.");
    });
});
