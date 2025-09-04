import axios from "axios";

/**
 * Class responsible for fetching data from a provided Url.
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
