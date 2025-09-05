import { describe, test, expect, afterEach } from '@jest/globals';
import { loadConfig } from "../../src/configLoader/configLoader.js";
import { writeFile, unlink } from "fs/promises";

/**
 * Test Suite for the config loader functions.
 */
describe("ConfigLoaderTests", () => {
    // Common test constants.
    // Creation of the test file path.
    const cTestFile = "testConfig.json";/* path.join(path.dirname, "testConfig.json"); */
    // Test schema for validation.
    const cValidSchema = {
        type: "object",
        properties: {
            arg1: { type: "string" },
            arg2: { type: "number" }
        },
        required: ["arg1", "arg2"],
        additionalProperties: false
    };

    /**
     * Deletes the test config file after each test to avoid side effects.
     */
    afterEach(async () => {
        try {
            await unlink(cTestFile);
        } catch {
            /* File may not exist, ignore error */
        }
    });

    /**
     * Tests that when a valid config file is provided, the Config Loader can
     * correctly parse and validate it.
     */
    test("ConfigLoader correctly parses a valid config file", async () => {
        const validConfig = { arg1: "a", arg2: 1 };
        await writeFile(cTestFile, JSON.stringify(validConfig));

        const result = await loadConfig(cTestFile, cValidSchema);

        expect(result).toEqual(validConfig);
    });

    /**
     * Tests that when an invalid config file missing a json property is provided, the 
     * Config Loader can correctly detect it and throw a validation error.
     */
    test("ConfigLoader throws error on an invalid config file (missing property)", async () => {
        const invalidConfig = { arg: 1 };
        await writeFile(cTestFile, JSON.stringify(invalidConfig));

        // Load config and expect it to throw an error.
        const expectedError = "Error parsing JSON config file: Provided config is invalid: data must have required property 'arg1'";
        await expect(loadConfig(cTestFile, cValidSchema)).rejects.toThrow(expectedError);
    });

    /**
     * Tests that when an invalid config file with a invalid json type is provided, the 
     * Config Loader can correctly detect it and throw a validation error.
     */
    test("ConfigLoader throws error on invalid config file (wrong type)", async () => {
        const invalidConfig = { arg1: "c", arg2: "not-a-number" };
        await writeFile(cTestFile, JSON.stringify(invalidConfig));

        // Load config and expect it to throw an error.
        const expectedError = "Error parsing JSON config file: Provided config is invalid: data/arg2 must be number";
        await expect(loadConfig(cTestFile, cValidSchema)).rejects.toThrow(expectedError);
    });

    /**
     * Tests that when an invalid config file with a malformed json is provided, the
     * Config Loader can correctly detect it and throw an error.
     */
    test("ConfigLoader throws error on invalid config file (malformed JSON)", async () => {
        await writeFile(cTestFile, "{ invalid json }");

        // Load config and expect it to throw an error.
        const expectedError = "Error parsing JSON config file: Expected property name or '}' in JSON at position 2 (line 1 column 3)";
        await expect(loadConfig(cTestFile, cValidSchema)).rejects.toThrow(expectedError);
    });

    /**
     * Tests that when a non existing file is provided, the Config Loader can 
     * correctly detect it and throw an error.
     */
    test("ConfigLoader throws error on non-existent config file", async () => {
        // No file is created here.

        // Load config and expect it to throw an error.
        const expectedError = "Error reading config file: ENOENT: no such file or directory, open 'testConfig.json'";
        await expect(loadConfig(cTestFile, cValidSchema)).rejects.toThrow(expectedError);
    });
});
