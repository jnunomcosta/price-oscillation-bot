/**
 * Engine class, responsible for having the having a start and stop
 * function that while running calls given callbacks for a certain 
 * amount of time given to it.
 */
export class Engine {
    // {number}
    #mOperationFrequency
    // {function}
    #mOperationCallback
    // {function}
    #mOperationParameter
    // {number}
    #mEngineTimerIdentifier

    /**
     * Constructor for the Engine class.
     * @param {number} pOperationFrequency
     *      The frequency in milliseconds (ms) that the engine will call the 
     *      operation callback.
     * @param {function} pOperationCallback
     *      The operation callback that the engine will call in each iteration.
     * @param {function} pOperationParameter
     *      The result callback that the engine will call after every iteration.
     */
    constructor(pOperationFrequency, pOperationCallback, pOperationParameter) {
        this.#mOperationFrequency = pOperationFrequency;
        this.#mOperationCallback = pOperationCallback;
        this.#mOperationParameter = pOperationParameter;
        this.#mEngineTimerIdentifier = null;
    }

    /**
     * Starts the engine with the given callbacks and frequency.
     */
    start() {
        this.#mEngineTimerIdentifier = setInterval(() => {
            this.#mOperationCallback(this.#mOperationParameter);
        }, this.#mOperationFrequency);
    }

    /**
     * Stops the engine if it's already running.
     */
    stop() {
        if (this.#mEngineTimerIdentifier != null) {
            clearInterval(this.#mEngineTimerIdentifier);
            this.#mEngineTimerIdentifier = null;
        }
    }
}
