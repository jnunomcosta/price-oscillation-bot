import { describe, test, expect, jest } from '@jest/globals';
import { Engine } from "../../src/engine/Engine.js";

// Configure jest to mock timers.
jest.useFakeTimers();

/**
 * Test Suite for the Engine class.
 */
describe("EngineTests", () => {
    // Common test constants.
    const cOpFrequency = 1000;

    /**
     * Tests that the engine can be created and started and restarted with 
     * a frequency of one second and that after 2 seconds pass that the 
     * engine called its callback three times.
     */
    test("Engine is able to be created and started with a 1s frequency", () => {
        // Create the mock callbacks and their expected call counter.
        var mockOpCallbackCalls = 0;
        const mockOpCallback = jest.fn();
        const opArgument = "Dummy";

        // Create and start the engine with the mock callbacks.
        var engine = new Engine(cOpFrequency, mockOpCallback, opArgument);
        engine.start();

        // Verify if no calls have been made to the callbacks.
        expect(mockOpCallback).toHaveBeenCalledTimes(mockOpCallbackCalls);

        // Advance time by 1 second.
        jest.advanceTimersByTime(1000);
        mockOpCallbackCalls++;

        // Now both functions should have been called 1 time.
        expect(mockOpCallback).toHaveBeenNthCalledWith(mockOpCallbackCalls, opArgument);

        // Advance time by another second.
        jest.advanceTimersByTime(1000);
        mockOpCallbackCalls++;

        // Now both functions should have been called 2 times.
        expect(mockOpCallback).toHaveBeenNthCalledWith(mockOpCallbackCalls, opArgument);

        // Stop the engine and move time forward.
        engine.stop();
        jest.advanceTimersByTime(1000);

        // No new calls are made after moving time forward.
        expect(mockOpCallback).toHaveBeenCalledTimes(mockOpCallbackCalls, opArgument);

        // Restart the engine.
        engine.start();

        // Advance time by another second.
        jest.advanceTimersByTime(1000);
        mockOpCallbackCalls++;

        // Now both functions should have been called 3 times.
        expect(mockOpCallback).toHaveBeenCalledTimes(mockOpCallbackCalls, opArgument);

        // Stop the engine again.
        engine.stop();
    });

    /**
     * Tests that no error occurs when the engine stop is called before an engine
     * start.
     */
    test("Tests that the engine stop function doesn't throw when no start was made", () => {
        // Create and start the engine with the mock callbacks.
        var engine = new Engine(cOpFrequency, jest.fn(), jest.fn());
        engine.stop();
    });
});
