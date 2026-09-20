import { describe, test, expect, jest } from '@jest/globals';
import { parseArguments } from '../../src/argumentParser/ArgumentParser.js';

/**
 * Test Suite for the argument parser functions.
 */
describe("ArgumentParserTests", () => {
    // Common test constants.

    // Dummy options for the parser.
    // Options: config file path, verbose flag, and an option with a default value.
    const cOptions = [
        { flags: '-c, --config <path>', description: 'Path to config file' },
        { flags: '-v, --verbose', description: 'Enable verbose mode', defaultValue: false },
        { flags: '-d, --defaulted <val>', description: 'Option with default', defaultValue: 'defaultVal' },
    ];

    /**
     * Tests that when all options are provided, the parser correctly parses and returns them.
     * Including options that differ from their default values.
     */
    test("ArgumentParser is able to parse all options correctly", () => {
        const args = ["node", "something.js", "-d", "customVal", "-v", "-c", "path/to/config/file"];

        const result = parseArguments(args, cOptions);

        expect(result.config).toBe("path/to/config/file");
        expect(result.verbose).toBe(true);
        expect(result.defaulted).toBe("customVal");
    });

    /**
     * Tests that when two equal options are provided, the last one takes precedence.
     */
    test("ArgumentParser overwrites an option when two equal options are provided", () => {
        const args = ["node", "something.js", "--config", "path/to/config/file", "-c", "path/to/another/config/file"];

        const result = parseArguments(args, cOptions);

        expect(result.config).toBe("path/to/another/config/file");
        expect(result.verbose).toBe(false);
        expect(result.defaulted).toBe("defaultVal");
    });

    /**
     * Tests that when no arguments are provided, the parser returns undefined for all 
     * options except those with default values.
     */
    test("ArgumentParser parses empty argument list", () => {
        const args = ["node", "something.js"];

        const result = parseArguments(args, cOptions);

        expect(result.config).toBeUndefined();
        expect(result.verbose).toBe(false);
        expect(result.defaulted).toBe("defaultVal");
    });

    /**
     * Tests that when unknown options are provided, the parser throws an error
     * and calls process.exit(1) (simulated with a jest spy).
     */
    test("ArgumentParser throws error and calls process.exit when an unknown argument is provided", () => {
        const args = ["node", "something.js", "--foo", "bar", "-c", "path/to/config/file"];

        // Inject a spy on process.exit to monitor if it's called.
        const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { });

        parseArguments(args, cOptions);

        // Expect process.exit to have been called with code 1.
        expect(exitSpy).toHaveBeenCalledWith(1);

        // Undo the spy to avoid side effects.
        exitSpy.mockRestore();
    });
});
