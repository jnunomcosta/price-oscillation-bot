import axios from "axios";

/**
 * Class responsible for fetching data from a provided Url.
 * 
 * TODO: This class can be extended in the future to support
 * authentication, retries, etc. The URL Can also be injected via
 * method and be able to be more versatile.
 */
export class FetchData {
    // {string}
    #mUrl
    // {number}
    #mTimeout

    /**
     * Fetch Data class constructor.
     * @param {string} pUrl
     *      The url to fetch data from.
     * @param {number} pTimeout
     *      An optional timeout value for the get operation.
     */
    constructor(pUrl, pTimeout = 1000) {
        this.#mUrl = pUrl;
        this.#mTimeout = pTimeout;
    }

    /**
     * Method that makes an http get on the Url.
     * @returns
     *      A promise that resolves either to the result or
     *      and error in case of failure.
     */
    fetchData(pUrlAppend) {
        const url = this.#mUrl + pUrlAppend;
        return new Promise((resolve, reject) => {
            axios
                .get(url, { timeout: this.#mTimeout })
                .then(response => {
                    resolve(response.data);
                })
                .catch(error => {
                    reject(error.message);
                });
        });
    }
}
