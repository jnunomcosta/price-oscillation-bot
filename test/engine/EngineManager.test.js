import { describe, test, expect, jest } from '@jest/globals';
import { EngineManager } from "../../src/engine/EngineManager.js";

// Configure jest to mock timers.
jest.useFakeTimers();

/**
 * Test Suite for the EngineManager class.
 */
describe("EngineManagerTests", () => {
    /**
     * Tests that the Engine Manager is able to create, start and stop two engine.
     * Since the instances of Engine are stored and only accessible on this class 
     * this test indirectly tests the Engine class also, using a very small jest to
     * quickly advance time and validate the scenario.
     */
    test("Engine Manager is able to create, start and stop 2 engines", () => {
        // Create mock operationCallback with jest.
        var operationCallback = jest.fn();

        // Create engine manager instance with mock callback.
        var engineManager = new EngineManager(operationCallback);

        // Create two engines with dummy data.
        const engId1 = "Dummy1";
        const engOpFreq1 = 1000;
        const engId2 = "Dummy2";
        const engOpFreq2 = 2000;
        engineManager.createEngine(engId1, engOpFreq1, engId1);
        engineManager.createEngine(engId2, engOpFreq2, engId2);

        // No calls to the callback are expected before starting the engine.
        expect(operationCallback).toHaveBeenCalledTimes(0);

        // The engines are started.
        engineManager.startEngines();

        // After time advances by one second the engine with "engId1" 
        // calls the callback once.
        jest.advanceTimersByTime(1000);
        expect(operationCallback).toHaveBeenCalledTimes(1);

        // After time advances by another seconds both engines "engId1"
        // and "engId2" trigger and they both call the callback one time.
        jest.advanceTimersByTime(1000);
        expect(operationCallback).toHaveBeenCalledTimes(3);

        // The engines are stopped.
        engineManager.stopEngines();
    });

    /**
     * Tests that the Engine Manager doesn't throw any errors when the engine
     * start and stop are called without any engines.
     */
    test("Engine Manager doesn't throw any error when calling start or stop with no engines", () => {
        // Create mock operationCallback with jest.
        var operationCallback = jest.fn();

        // Create engine manager instance with mock callback.
        var engineManager = new EngineManager(operationCallback);

        // Expect 0 calls of the alert callback.
        expect(operationCallback).toHaveBeenCalledTimes(0);

        engineManager.startEngines();

        // Expect 0 calls of the alert callback.
        expect(operationCallback).toHaveBeenCalledTimes(0);

        engineManager.stopEngines();

        // Expect 0 calls of the alert callback.
        expect(operationCallback).toHaveBeenCalledTimes(0);
    });
});
