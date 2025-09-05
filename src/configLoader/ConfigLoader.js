import { readFile } from "fs/promises";
import { Ajv } from "ajv";

/**
 * Loads and validates a JSON config file against a given schema.
 * 
 * @param {string} pPath
 *      Path to the config file.
 * @param {object} pSchema 
 *      JSON schema to validate the config file against.
 * @returns {Promise<object>} 
 *      The validated config object.
 */
export async function loadConfig(pPath, pSchema) {
    // Initialize AJV and compile the schema.
    const ajvInstance = new Ajv();
    const validate = ajvInstance.compile(pSchema);

    // Read and parse the config file.
    var fileData;
    try {
        fileData = await readFile(pPath, "utf-8");
    } catch (err) {
        throw new Error("Error reading config file: " + err.message);
    }

    // Try to parse the read JSON data.
    try {
        const config = JSON.parse(fileData);

        // Validate the config against the schema.
        if (!validate(config)) {
            throw new Error("Provided config is invalid: " + ajvInstance.errorsText(validate.errors));
        }

        return config;
    } catch (err) {
        throw new Error("Error parsing JSON config file: " + err.message);
    }
}
