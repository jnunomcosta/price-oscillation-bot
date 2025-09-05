import { Engine } from "./Engine.js";

/**
 * Engine Manager class, responsible for managing the various
 * Engine instances.
 * 
 * TODO: This class can be extended in the future to support
 * starting / stopping / removal of individual engines, as well 
 * as creating new types of engines underneath.
 */
export class EngineManager {
    // {map}
    #mEngines
    // {function}
    #mOperationCallback

    /**
     * Engine Manager class constructor.
     * 
     * @param {function} pOperationCallback 
     *      The operation callback that will be called by the 
     *      several engines. This callback is expected to have
     *      the following signature: function (string arg) : void.
     */
    constructor(pOperationCallback) {
        this.#mEngines = new Map();
        this.#mOperationCallback = pOperationCallback;
    }

    /**
     * Creates a new engine instance based on the engine identifier,
     * frequency in which it operates and the callback inputs that
     * it will have.
     * 
     * @param {string} pEngineIdentifier 
     *      The engine identifier string.
     * @param {number} pEngineOperationFrequency
     *      The operating frequency of the engine value.
     * @param {function} pOperationCallbackInputs 
     *      The inputs that will be passed to the operation callback. 
     */
    createEngine(pEngineIdentifier, pEngineOperationFrequency, pOperationCallbackInputs) {
        this.#mEngines.set(
            pEngineIdentifier,
            new Engine(pEngineOperationFrequency, this.#mOperationCallback, pOperationCallbackInputs));
    }

    /**
     * Starts all the created engines.
     */
    startEngines() {
        for (const engine of this.#mEngines.values()) {
            engine.start();
        }
    }

    /**
     * Stops all the created engines.
     */
    stopEngines() {
        for (const engine of this.#mEngines.values()) {
            engine.stop();
        }
    }
}
