import { Command } from "commander";

/**
 * Parses command line arguments to extract options based on a provided options array.
 * 
 * @param {Array<string>} pArguments 
 *      Program parameters array.
 * @param {Array<object>} pOptionsArray 
 *      Array of option definitions for Commander (e.g., 
 *      [{ flags: '-s, --something <path>', description: 'Something here' },
 *      { flags: '-d, --dummy', description: 'Dummy Option', defaultValue: false }]).
 * @returns {object} 
 *      The parsed options object.
 */
export function parseArguments(pArguments, pOptionsArray) {
    const program = new Command();

    pOptionsArray.forEach(opt => {
        if (Object.hasOwn(opt, "defaultValue")) {
            program.option(opt.flags, opt.description, opt.defaultValue);
        }
        else {
            program.option(opt.flags, opt.description);
        }
    });

    // Parse the provided argv array.
    program.parse(pArguments);

    // Return the parsed options object.
    return program.opts();
}
