import { describe, test, expect } from '@jest/globals';
import { PriceProviderFactory } from "../../src/priceProvider/PriceProviderFactory.js";
import { UpholdProvider } from "../../src/priceProvider/UpholdProvider.js";
import { CoinbaseProvider } from "../../src/priceProvider/CoinbaseProvider.js";
import { KrakenProvider } from "../../src/priceProvider/KrakenProvider.js";
import { BinanceProvider } from "../../src/priceProvider/BinanceProvider.js";

/**
 * Test Suite for the Price Provider Factory class.
 */
describe("PriceProviderFactoryTests", () => {

    /**
     * Tests that createProvider returns an instance of the correct provider
     * class for each implemented type.
     */
    test("PriceProviderFactory createProvider returns the correct class per type", () => {
        expect(PriceProviderFactory.createProvider("uphold")).toBeInstanceOf(UpholdProvider);
        expect(PriceProviderFactory.createProvider("coinbase")).toBeInstanceOf(CoinbaseProvider);
        expect(PriceProviderFactory.createProvider("kraken")).toBeInstanceOf(KrakenProvider);
        expect(PriceProviderFactory.createProvider("binance")).toBeInstanceOf(BinanceProvider);
    });

    /**
     * Tests that createProvider throws when given an unimplemented type.
     */
    test("PriceProviderFactory createProvider throws on an unknown type", () => {
        expect(() => PriceProviderFactory.createProvider("bogus-exchange")).toThrow(
            "Unknown price provider type: bogus-exchange");
    });
});
