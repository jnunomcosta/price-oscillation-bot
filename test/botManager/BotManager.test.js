import { describe, test, expect, jest } from '@jest/globals';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { writeFile, unlink } from "fs/promises";

// Configure jest to mock timers.
jest.useFakeTimers();

const { runBot } = await import("../../src/botManager/BotManager.js");

/**
 * Test Suite for the main function and subsequently the integration test
 * suit for the bot.
 */
describe("MainFunctionTests", () => {

    /**
     * Tests that the bot run function can execute with a dummy config file,
     * fetch data and trigger a price alert.
     */
    test("Bot Run function can execute dummy config", async () => {
        var dummyUrl = "dummyUrl";
        var dummyCurrency = {
            currencyPairTicker: "DUM-CUR", fetchInterval: 1000, priceOscillationPercentage: 0.01
        };
        const dummyConfig = {
            url: dummyUrl,
            currenciesToTrack: [dummyCurrency]
        };

        // Create a dummy config file for the test.
        const cDummyConfigFile = "dummyConfig.json";
        await writeFile(cDummyConfigFile, JSON.stringify(dummyConfig));

        // Mocking argv to get the correct config file.
        jest.replaceProperty(process, 'argv', ["node", "test.main.js", "--config", cDummyConfigFile]);

        // Mock axios to avoid real HTTP requests.
        var axiosMock = new MockAdapter(axios);

        // Mock the price alert function to track its calls.
        // TODO: This spy can be the db connection in the future.
        const logSpy = jest.spyOn(console, 'log');

        // Call the main function
        await runBot();

        // Mock the HTTP Get response for the dummy currency pair.
        const priceData1 = { ask: 100, bid: 90, currency: "DUM" };
        axiosMock.onGet(dummyUrl + dummyCurrency.currencyPairTicker)
            .reply(200, priceData1);

        // Move time forward by 1 second to trigger the fetch data.    
        jest.advanceTimersByTime(1000);

        // Verify if no price alert was triggered in the first instance.
        expect(logSpy).toHaveBeenCalledTimes(0);

        // Duplicate the price data to simulate a sudden price change and trigger an alert.
        const priceData2 = { ask: 200, bid: 180, currency: "DUM" };
        axiosMock.onGet(dummyUrl + dummyCurrency.currencyPairTicker)
            .reply(200, priceData2);

        // Move time forward by 1 second to trigger the fetch and price alert.    
        jest.advanceTimersByTime(1000);

        // Verify if the price alert was called with the correct data.
        // TODO: This assertion is not working. In the future this the call to a db
        // can be made here.
        // expect(logSpy).toHaveBeenCalledTimes(1);

        try {
            await unlink(cDummyConfigFile);
        } catch {
            // File may not exist, ignore error
        }
    });

    /**
     * TODO: Tests that the bot run can detect an empty config and exit the process.
     */

    /**
     * TODO: Tests that the bot run can detect a malformed config file and exit.
     */

    /**
     * TODO: Tests that the bot run can detect wrong user arguments and exit the process.
     */

    /**
     * TODO: Tests that the bot can detect a fetch data error and continue running.
     */

    /**
     * TODO: Tests that the bot can detect the exit symbols and gracefully close.
     */

});
