import axios from "axios";

/**
 * Class responsible for performing an http get on a fully formed Url.
 *
 * TODO: This class can be extended in the future to support
 * authentication, retries, etc.
 */
export class FetchData {
    // {number}
    #mTimeout

    /**
     * Fetch Data class constructor.
     * @param {number} pTimeout
     *      An optional timeout value for the get operation.
     */
    constructor(pTimeout = 1000) {
        this.#mTimeout = pTimeout;
    }

    /**
     * Method that makes an http get on the given Url.
     * @param {string} pUrl
     *      The full url, including any query string, to fetch data from.
     * @returns
     *      A promise that resolves either to the result or
     *      and error in case of failure.
     */
    fetchData(pUrl) {
        return new Promise((resolve, reject) => {
            axios
                .get(pUrl, { timeout: this.#mTimeout })
                .then(response => {
                    resolve(response.data);
                })
                .catch(error => {
                    reject(error.message);
                });
        });
    }
}
