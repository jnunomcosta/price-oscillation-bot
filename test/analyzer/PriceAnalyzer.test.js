import { describe, test, expect } from '@jest/globals';
import { PriceAnalyzer } from "../../src/analyzer/PriceAnalyzer.js";

/**
 * Test Suite for the PriceAnalyzer class and its analyze functionality.
 */
describe("PriceAnalyzerTests", () => {
    const cCurrencyPair = "BTC-USD";
    const cThreshold = 0.01;

    /**
     * Tests that when the PriceAnalyzer class is not initialized with an old price alert
     * that the no new alert is triggered when analyzing the value for the 
     * first time.
     */
    test("Analyzer does not trigger alert on the first run", () => {
        var calls = 0;
        var callback = function () { calls++; };
        var analyzer = new PriceAnalyzer(cCurrencyPair, cThreshold, callback);
        analyzer.analyze(1);
        expect(calls).toEqual(0);
    });

    /**
     * Tests that when the Analyzer class analyzes a new price that is lower than the
     * the alert threshold that no new alert is triggered.
     */
    test("Analyzer does not trigger alert on oscillation if threshold is not reached", () => {
        var oldPriceAlert = 110878;
        var newPrice = 110879;

        var calls = 0;
        var callback = function () { calls++; };
        var analyzer = new PriceAnalyzer(cCurrencyPair, cThreshold, callback, oldPriceAlert);

        analyzer.analyze(newPrice);
        expect(calls).toEqual(0);
    });

    /**
     * Tests that when the Analyzer class analyzes a new price that increases or
     * decreases by 0.9% compared to its previous alert price, that a new alert 
     * is triggered for that price.
     */
    const testData = [
        { oldPrice: 100879, newPrice: 110879 },
        { oldPrice: 110879, newPrice: 100879 }];
    test.each(testData)(
        "Provided Arguments [old price: $oldPrice and new price: $newPrice] \
        should trigger an alert by the Analyzer",
        ({ oldPrice, newPrice }) => {
            var oldPriceAlert = oldPrice;
            var newPriceAlert = null;

            var callback = function (priceAlert) { newPriceAlert = priceAlert.getCurrentPrice(); };
            var analyzer = new PriceAnalyzer(cCurrencyPair, cThreshold, callback, oldPriceAlert);

            analyzer.analyze(newPrice);
            expect(newPriceAlert).toEqual(newPrice);
        });

    /**
     * Tests that given 10 iterations of analyzing a duplicating price that an alert is always
     * triggered with valid data.
     */
    test("Analyzer returns alerts on a new price that duplicates over time", () => {
        var oldPriceAlert = 1;
        var newPrice = 2;
        var priceAlertObj = null;

        var callback = function (priceAlert) { priceAlertObj = priceAlert };
        var analyzer = new PriceAnalyzer(cCurrencyPair, cThreshold, callback, oldPriceAlert);

        // Starting the timestamp here before any analysis so that we can verify that
        // time moves forward.
        var timestamp = Date.now();
        // Setting comparable variation to 1 since we will always duplicate.
        const variation = 1;

        for (var i = 0; i < 10; i++) {
            analyzer.analyze(newPrice);

            expect(priceAlertObj.getCurrencyPair()).toEqual(cCurrencyPair);
            expect(priceAlertObj.getTimestamp()).toBeGreaterThanOrEqual(timestamp);
            expect(priceAlertObj.getVariation()).toEqual(variation);
            expect(priceAlertObj.getPreviousAlertPrice()).toEqual(oldPriceAlert);
            expect(priceAlertObj.getCurrentPrice()).toEqual(newPrice);

            timestamp = priceAlertObj.getTimestamp();
            oldPriceAlert = priceAlertObj.getCurrentPrice();
            newPrice *= 2;
        }
    });
});
