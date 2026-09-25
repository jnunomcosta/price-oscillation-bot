import { describe, test, expect } from '@jest/globals';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { FetchData } from "../../src/backendConnection/FetchData.js";

/**
 * Test Suite for the Fetch Data class.
 */
describe("FetchDataTests", () => {
    // Common test constants.
    const cUrl = "dummyUrl/ticker";
    const cTimeout = 1500;

    /**
     * Tests that the Fetch data method successfully returns the correct
     * data on a successful http get request.
     */
    test("Fetch Data returns the correct data on successful request", () => {
        // Configure the Mock response
        const priceData = { ask: 123, bid: 456, currency: "USD" };
        var mock = new MockAdapter(axios);

        var fetchData = new FetchData(cTimeout);

        mock.onGet(cUrl).reply(200, priceData);

        fetchData.fetchData(cUrl).then(response => {
            expect(response.ask).toEqual(priceData.ask);
            expect(response.bid).toEqual(priceData.bid);
            expect(response.currency).toEqual(priceData.currency);
        });
    });

    /**
     * Tests that when the HTTP get fails (status code != 200) that fetch data
     * returns an error with this information.
     */
    test("Fetch Data returns an error in a http get status failure", () => {
        // Configure the Mock response
        const priceData = {};
        var mock = new MockAdapter(axios);

        var fetchData = new FetchData(cTimeout);

        const notFoundStatus = 404;
        mock.onGet(cUrl).reply(notFoundStatus, priceData);

        fetchData.fetchData(cUrl).catch(error => {
            expect(error).toEqual("Request failed with status code " + notFoundStatus);
        });
    });

    /**
     * Tests that when using the default constructor without any timeout
     * that a timeout occurs and returns an error after the default 1s.
     */
    test("Fetch Data returns an error in a http get timeout", () => {
        var mock = new MockAdapter(axios);

        var fetchData = new FetchData();

        mock.onGet(cUrl).timeout();

        fetchData.fetchData(cUrl).catch(error => {
            expect(error).toEqual("timeout of 1000ms exceeded");
        });
    });
});
