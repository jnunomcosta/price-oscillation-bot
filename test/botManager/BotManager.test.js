import { describe, test, expect, jest, afterEach } from '@jest/globals';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { writeFile, unlink } from "fs/promises";

// Configure jest to mock timers.
jest.useFakeTimers();

const { runBot } = await import("../../src/botManager/BotManager.js");

/**
 * Writes the given config object to a uniquely named temp file, patches
 * process.argv to point the bot at it, and returns the file's path so the
 * caller can clean it up.
 *
 * @param {object} pConfigObject
 *      The config object to write to disk.
 * @returns {Promise<string>}
 *      The path of the written config file.
 */
async function writeAndUseConfig(pConfigObject) {
    const configFile = "dummyConfig-" + Math.random().toString(36).slice(2) + ".json";
    await writeFile(configFile, JSON.stringify(pConfigObject));
    jest.replaceProperty(process, 'argv', ["node", "test.main.js", "--config", configFile]);
    return configFile;
}

/**
 * Test Suite for the main function and subsequently the integration test
 * suit for the bot.
 */
describe("MainFunctionTests", () => {
    // Common test constants.
    const cUpholdUrl = "https://api.uphold.com/v0/ticker/";
    const cCoinbaseUrl = "https://api.exchange.coinbase.com/";
    const cKrakenUrl = "https://api.kraken.com/0/public/Ticker";
    const cBinanceUrl = "https://api.binance.com/api/v3/ticker/bookTicker";

    /**
     * Clears any engines left running by a previous test, so their timers do
     * not fire (and interfere) during a later, unrelated test, and restores
     * spies so call counts do not leak between tests either.
     */
    afterEach(() => {
        jest.clearAllTimers();
        jest.restoreAllMocks();
    });

    /**
     * Tests that the bot run function can execute with a dummy Uphold config
     * file, fetch data and trigger a price alert.
     */
    test("Bot Run function can execute dummy config for Uphold", async () => {
        const dummyCurrency = {
            provider: "uphold-main", currencyPairTicker: "DUM-CUR", fetchInterval: 1000, priceOscillationPercentage: 0.01
        };
        const dummyConfig = {
            providers: { "uphold-main": { type: "uphold", url: cUpholdUrl } },
            currenciesToTrack: [dummyCurrency]
        };

        const configFile = await writeAndUseConfig(dummyConfig);

        // Mock axios to avoid real HTTP requests.
        var axiosMock = new MockAdapter(axios);

        // Mock the price alert function to track its calls.
        const logSpy = jest.spyOn(console, 'log');

        // Call the main function
        await runBot();

        // Mock the HTTP Get response for the dummy currency pair.
        const priceData1 = { ask: 100, bid: 90, currency: "DUM" };
        axiosMock.onGet(cUpholdUrl + dummyCurrency.currencyPairTicker).reply(200, priceData1);

        // Move time forward by 1 second to trigger the fetch data.
        await jest.advanceTimersByTimeAsync(1000);

        // Verify if no price alert was triggered in the first instance.
        expect(logSpy).toHaveBeenCalledTimes(0);

        // Duplicate the price data to simulate a sudden price change and trigger an alert.
        const priceData2 = { ask: 200, bid: 180, currency: "DUM" };
        axiosMock.onGet(cUpholdUrl + dummyCurrency.currencyPairTicker).reply(200, priceData2);

        // Move time forward by 1 second to trigger the fetch and price alert.
        await jest.advanceTimersByTimeAsync(1000);

        // Verify that the alert fired and names the composite provider:ticker key.
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("uphold-main:DUM-CUR"));

        await unlink(configFile).catch(() => { });
    });

    /**
     * Tests that the bot can fetch and alert from a Coinbase provider,
     * whose ticker Url is built from the exchange endpoint and whose ask
     * price arrives as a JSON string.
     */
    test("Bot Run function can execute dummy config for Coinbase", async () => {
        const dummyCurrency = {
            provider: "coinbase-main", currencyPairTicker: "BTC-USD", fetchInterval: 1000, priceOscillationPercentage: 0.01
        };
        const dummyConfig = {
            providers: { "coinbase-main": { type: "coinbase", url: cCoinbaseUrl } },
            currenciesToTrack: [dummyCurrency]
        };

        const configFile = await writeAndUseConfig(dummyConfig);
        var axiosMock = new MockAdapter(axios);
        const logSpy = jest.spyOn(console, 'log');

        await runBot();

        const coinbaseUrl = cCoinbaseUrl + "products/" + dummyCurrency.currencyPairTicker + "/ticker";
        axiosMock.onGet(coinbaseUrl).reply(200, { ask: "100.00", bid: "99.00" });
        await jest.advanceTimersByTimeAsync(1000);
        expect(logSpy).toHaveBeenCalledTimes(0);

        axiosMock.onGet(coinbaseUrl).reply(200, { ask: "200.00", bid: "199.00" });
        await jest.advanceTimersByTimeAsync(1000);
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("coinbase-main:BTC-USD"));

        await unlink(configFile).catch(() => { });
    });

    /**
     * Tests that the bot can fetch and alert from a Kraken provider, whose
     * response key differs from the requested symbol and whose ask price
     * is nested inside an array of JSON strings.
     */
    test("Bot Run function can execute dummy config for Kraken", async () => {
        const dummyCurrency = {
            provider: "kraken-main", currencyPairTicker: "XBTUSD", fetchInterval: 1000, priceOscillationPercentage: 0.01
        };
        const dummyConfig = {
            providers: { "kraken-main": { type: "kraken", url: cKrakenUrl } },
            currenciesToTrack: [dummyCurrency]
        };

        const configFile = await writeAndUseConfig(dummyConfig);
        var axiosMock = new MockAdapter(axios);
        const logSpy = jest.spyOn(console, 'log');

        await runBot();

        const krakenUrl = cKrakenUrl + "?pair=" + dummyCurrency.currencyPairTicker;
        axiosMock.onGet(krakenUrl).reply(200, { error: [], result: { XXBTZUSD: { a: ["100.0", "1", "1.0"] } } });
        await jest.advanceTimersByTimeAsync(1000);
        expect(logSpy).toHaveBeenCalledTimes(0);

        axiosMock.onGet(krakenUrl).reply(200, { error: [], result: { XXBTZUSD: { a: ["200.0", "1", "1.0"] } } });
        await jest.advanceTimersByTimeAsync(1000);
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("kraken-main:XBTUSD"));

        await unlink(configFile).catch(() => { });
    });

    /**
     * Tests that the bot can fetch and alert from a Binance provider,
     * whose symbol is passed as a query parameter and whose ask price
     * arrives as a JSON string under "askPrice".
     */
    test("Bot Run function can execute dummy config for Binance", async () => {
        const dummyCurrency = {
            provider: "binance-main", currencyPairTicker: "BTCUSDT", fetchInterval: 1000, priceOscillationPercentage: 0.01
        };
        const dummyConfig = {
            providers: { "binance-main": { type: "binance", url: cBinanceUrl } },
            currenciesToTrack: [dummyCurrency]
        };

        const configFile = await writeAndUseConfig(dummyConfig);
        var axiosMock = new MockAdapter(axios);
        const logSpy = jest.spyOn(console, 'log');

        await runBot();

        const binanceUrl = cBinanceUrl + "?symbol=" + dummyCurrency.currencyPairTicker;
        axiosMock.onGet(binanceUrl).reply(200, { symbol: "BTCUSDT", bidPrice: "99.0", askPrice: "100.0" });
        await jest.advanceTimersByTimeAsync(1000);
        expect(logSpy).toHaveBeenCalledTimes(0);

        axiosMock.onGet(binanceUrl).reply(200, { symbol: "BTCUSDT", bidPrice: "199.0", askPrice: "200.0" });
        await jest.advanceTimersByTimeAsync(1000);
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("binance-main:BTCUSDT"));

        await unlink(configFile).catch(() => { });
    });

    /**
     * Tests that the same underlying asset can be watched on two different
     * providers in the same process, each alerting independently under its
     * own composite "provider:ticker" key. This is the regression test for
     * the key collision that a bare ticker key would cause.
     */
    test("Bot Run function tracks the same asset on two providers independently", async () => {
        const upholdCurrency = {
            provider: "uphold-main", currencyPairTicker: "BTC-USD", fetchInterval: 1000, priceOscillationPercentage: 0.01
        };
        const krakenCurrency = {
            provider: "kraken-main", currencyPairTicker: "XBTUSD", fetchInterval: 1000, priceOscillationPercentage: 0.01
        };
        const dummyConfig = {
            providers: {
                "uphold-main": { type: "uphold", url: cUpholdUrl },
                "kraken-main": { type: "kraken", url: cKrakenUrl }
            },
            currenciesToTrack: [upholdCurrency, krakenCurrency]
        };

        const configFile = await writeAndUseConfig(dummyConfig);
        var axiosMock = new MockAdapter(axios);
        const logSpy = jest.spyOn(console, 'log');

        await runBot();

        const upholdUrl = cUpholdUrl + upholdCurrency.currencyPairTicker;
        const krakenUrl = cKrakenUrl + "?pair=" + krakenCurrency.currencyPairTicker;

        axiosMock.onGet(upholdUrl).reply(200, { ask: 100 });
        axiosMock.onGet(krakenUrl).reply(200, { error: [], result: { XXBTZUSD: { a: ["100.0", "1", "1.0"] } } });
        await jest.advanceTimersByTimeAsync(1000);
        expect(logSpy).toHaveBeenCalledTimes(0);

        axiosMock.onGet(upholdUrl).reply(200, { ask: 200 });
        axiosMock.onGet(krakenUrl).reply(200, { error: [], result: { XXBTZUSD: { a: ["300.0", "1", "1.0"] } } });
        await jest.advanceTimersByTimeAsync(1000);

        // Both providers should have alerted, each under its own distinct composite key.
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("uphold-main:BTC-USD"));
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("kraken-main:XBTUSD"));

        await unlink(configFile).catch(() => { });
    });

    /**
     * Tests that a currency entry referencing an unknown provider name
     * causes the bot to log an error and exit non-zero rather than
     * silently running a dead engine. Also verifies that, even if
     * process.exit is mocked and does not actually terminate the process
     * (as here), no engine is wired up for the invalid entry: advancing
     * timers must not throw.
     */
    test("Bot Run function exits when a currency references an unknown provider", async () => {
        const dummyConfig = {
            providers: { "uphold-main": { type: "uphold", url: cUpholdUrl } },
            currenciesToTrack: [
                { provider: "does-not-exist", currencyPairTicker: "BTC-USD", fetchInterval: 1000, priceOscillationPercentage: 0.01 }
            ]
        };

        const configFile = await writeAndUseConfig(dummyConfig);
        const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { });

        await runBot();

        expect(exitSpy).toHaveBeenCalledWith(1);

        // If an engine had still been created for the invalid entry, this
        // would throw a TypeError trying to resolve a provider that is not
        // in the registry.
        await expect(jest.advanceTimersByTimeAsync(1000)).resolves.not.toThrow();

        exitSpy.mockRestore();
        await unlink(configFile).catch(() => { });
    });

    /**
     * Tests that tracking the same provider and ticker twice causes the
     * bot to log an error and exit non-zero, rather than silently dropping
     * one of the two engines.
     */
    test("Bot Run function exits when a provider/ticker combination is duplicated", async () => {
        const dummyCurrency = {
            provider: "uphold-main", currencyPairTicker: "BTC-USD", fetchInterval: 1000, priceOscillationPercentage: 0.01
        };
        const dummyConfig = {
            providers: { "uphold-main": { type: "uphold", url: cUpholdUrl } },
            currenciesToTrack: [dummyCurrency, dummyCurrency]
        };

        const configFile = await writeAndUseConfig(dummyConfig);
        const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { });

        await runBot();

        expect(exitSpy).toHaveBeenCalledWith(1);

        exitSpy.mockRestore();
        await unlink(configFile).catch(() => { });
    });

    /**
     * Tests that a provider registry entry declaring an unimplemented type
     * fails schema validation at startup, causing the bot to exit non-zero.
     */
    test("Bot Run function exits when a provider declares an unimplemented type", async () => {
        const dummyConfig = {
            providers: { "bogus-main": { type: "bogus-exchange" } },
            currenciesToTrack: [
                { provider: "bogus-main", currencyPairTicker: "BTC-USD", fetchInterval: 1000, priceOscillationPercentage: 0.01 }
            ]
        };

        const configFile = await writeAndUseConfig(dummyConfig);
        const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { });

        await runBot();

        expect(exitSpy).toHaveBeenCalledWith(1);

        exitSpy.mockRestore();
        await unlink(configFile).catch(() => { });
    });

    /**
     * Tests that a Kraken response carrying a non-empty error array is
     * logged and skipped rather than feeding a garbage price into the
     * analyzer, and that the process keeps running.
     */
    test("Bot Run function skips a Kraken response carrying an error array", async () => {
        const dummyCurrency = {
            provider: "kraken-main", currencyPairTicker: "XBTUSD", fetchInterval: 1000, priceOscillationPercentage: 0.01
        };
        const dummyConfig = {
            providers: { "kraken-main": { type: "kraken", url: cKrakenUrl } },
            currenciesToTrack: [dummyCurrency]
        };

        const configFile = await writeAndUseConfig(dummyConfig);
        var axiosMock = new MockAdapter(axios);
        const logSpy = jest.spyOn(console, 'log');

        await runBot();

        const krakenUrl = cKrakenUrl + "?pair=" + dummyCurrency.currencyPairTicker;
        axiosMock.onGet(krakenUrl).reply(200, { error: ["EQuery:Unknown asset pair"], result: {} });
        await jest.advanceTimersByTimeAsync(1000);

        // No alert should fire, but an error identifying provider and ticker is logged.
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("kraken-main"));
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("XBTUSD"));

        await unlink(configFile).catch(() => { });
    });

    /**
     * Tests that a response body missing the expected price field is
     * logged and skipped rather than feeding a garbage number into the
     * analyzer.
     */
    test("Bot Run function skips a response missing the expected price field", async () => {
        const dummyCurrency = {
            provider: "uphold-main", currencyPairTicker: "BTC-USD", fetchInterval: 1000, priceOscillationPercentage: 0.01
        };
        const dummyConfig = {
            providers: { "uphold-main": { type: "uphold", url: cUpholdUrl } },
            currenciesToTrack: [dummyCurrency]
        };

        const configFile = await writeAndUseConfig(dummyConfig);
        var axiosMock = new MockAdapter(axios);
        const logSpy = jest.spyOn(console, 'log');

        await runBot();

        const upholdUrl = cUpholdUrl + dummyCurrency.currencyPairTicker;
        axiosMock.onGet(upholdUrl).reply(200, { bid: 90, currency: "USD" });
        await jest.advanceTimersByTimeAsync(1000);

        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Error extracting price"));

        await unlink(configFile).catch(() => { });
    });

    /**
     * Tests that string prices from an exchange (Kraken/Binance) are
     * converted to numbers before analysis, so the oscillation comparison
     * is arithmetic rather than a string comparison.
     */
    test("Bot Run function analyzes string prices numerically", async () => {
        const dummyCurrency = {
            provider: "binance-main", currencyPairTicker: "BTCUSDT", fetchInterval: 1000, priceOscillationPercentage: 0.01
        };
        const dummyConfig = {
            providers: { "binance-main": { type: "binance", url: cBinanceUrl } },
            currenciesToTrack: [dummyCurrency]
        };

        const configFile = await writeAndUseConfig(dummyConfig);
        var axiosMock = new MockAdapter(axios);
        const logSpy = jest.spyOn(console, 'log');

        await runBot();

        const binanceUrl = cBinanceUrl + "?symbol=" + dummyCurrency.currencyPairTicker;

        // "100.5" and "101.0" arrive as JSON strings. If they were compared
        // as strings rather than converted to numbers, the alert message
        // would not report the correct arithmetic variation below.
        axiosMock.onGet(binanceUrl).reply(200, { askPrice: "100.5" });
        await jest.advanceTimersByTimeAsync(1000);
        expect(logSpy).toHaveBeenCalledTimes(0);

        axiosMock.onGet(binanceUrl).reply(200, { askPrice: "101.0" });
        await jest.advanceTimersByTimeAsync(1000);

        // (101.0 - 100.5) / 100.5 = 0.4975%.
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("variation of 0.4975%"));

        await unlink(configFile).catch(() => { });
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
     * TODO: Tests that the bot can detect the exit symbols and gracefully close.
     */

});
