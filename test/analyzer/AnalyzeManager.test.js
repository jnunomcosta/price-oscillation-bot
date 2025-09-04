import { describe, test, expect, jest } from '@jest/globals';
import { AnalyzeManager } from "../../src/analyzer/AnalyzeManager.js";

/**
 * Test Suite for the AnalyzeManager class.
 */
describe("AnalyzeManagerTests", () => {
    // Common constants for the tests.
    const cThreshold = 0.00000000001;

    /**
     * Tests that the Analyze Manager is able to add two currency pair analyzers and use both of 
     * them. Since the instances of PriceAnalyzer are stored and only accessible on this class 
     * this test indirectly tests the PriceAnalyzer class also, using a very small threshold to
     * trigger the alert callback.
     */
    test("Analyze Manager successfully adds two analyzer and analyzes the prices", () => {
        // Create mock alertCallback with jest.
        var alertCallback = jest.fn();

        const currencyPair1 = "Dummy1";
        const currencyPair2 = "Dummy2";

        // Create analyze manager instance with mock callback.
        var analyzeManager = new AnalyzeManager(alertCallback);

        // Add the dummy currency pairs and analyze the first price to have base "last price".
        analyzeManager.addCurrencyPairToAnalyze(currencyPair1, cThreshold);
        analyzeManager.analyzePrice(currencyPair1, 1);
        analyzeManager.addCurrencyPairToAnalyze(currencyPair2, cThreshold);
        analyzeManager.analyzePrice(currencyPair2, 1);

        // The second analyzes with a new price double the first one will result in two alerts.
        analyzeManager.analyzePrice(currencyPair1, 2);
        expect(alertCallback).toHaveBeenCalledTimes(1);
        analyzeManager.analyzePrice(currencyPair2, 2);
        expect(alertCallback).toHaveBeenCalledTimes(2);
    });

    /**
     * Tests that the AnalyzeManager doesn't analyze a new price for a currency that
     * wasn't added first.
     */
    test("Analyze Manager doesn't analyze a currency that wasn't added", () => {
        // Create mock alertCallback with jest.
        var alertCallback = jest.fn();

        const currencyPair1 = "Dummy1";

        // Create analyzeManager instance with mock callback.
        var analyzeManager = new AnalyzeManager(alertCallback);

        // Analyze two prices for the same unknown currency pair.
        analyzeManager.analyzePrice(currencyPair1, 1);
        analyzeManager.analyzePrice(currencyPair1, 2);

        // Expect 0 calls of the alert callback.
        expect(alertCallback).toHaveBeenCalledTimes(0);
    });
});
