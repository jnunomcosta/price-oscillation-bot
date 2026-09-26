# Currency Price Oscillation Bot

A Node.js bot that monitors currency price oscillations across [Uphold](https://uphold.com/en/developer/api/documentation/), [Coinbase](https://docs.cloud.coinbase.com/exchange/reference), [Kraken](https://docs.kraken.com/rest/) and [Binance](https://binance-docs.github.io/apidocs/spot/en/), and triggers alerts when price changes exceed a configurable threshold.

---

## Features

- **Monitors currency pairs** (e.g., BTC-USD) for price changes, on any of four supported exchanges.
- **Configurable price oscillation threshold** for alerts, per tracked pair.
- **Pluggable alert callback** (default: logs to console).
- **Modular, extensible architecture** (analyzers, engines, fetchers, price providers).
- **Tested with Jest** and includes unit tests.

---

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Architecture](#architecture)
- [Development](#development)
- [Example Output](#example-output)
- [Future Work](#future-work)

---

## Installation

1. **Prerequisites:**

Make sure node and npm are installed in your machine. Node version **>v20**.

2. **Clone the repository:**

```sh
git clone git@github.com:jnunomcosta/uphold-bot.git
cd uphold-bot
```

3. **Install Dependencies:**

```sh
npm install
```

## Usage

Start the bot with (this uses a default configuration):

```sh
npm run start
```

To start the bot with a custom configuration simply pass the configuration file like this:

```sh
npm run start -- --config /path/to/your/config
```

To stop the bot the SIGINT signal (crtl+c) can be used.

## Configuration

To configure the bot execution, it needs a json file passed as argument. It declares a named registry of
providers (which exchange, and optionally which url), and one or more currency pairs to track, each
referencing one of those providers by name:

```json
{
    "providers": {
        "uphold-main": { "type": "uphold" },
        "kraken-main": { "type": "kraken", "url": "https://api.kraken.com/0/public/Ticker" }
    },
    "currenciesToTrack": [
        {
            "provider": "uphold-main",             // References a name in "providers".
            "currencyPairTicker": "BTC-USD",       // Currency Ticker, in that provider's own vocabulary.
            "fetchInterval": 5000,                 // Fetch interval in milliseconds (ms)
            "priceOscillationPercentage": 0.001    // Price oscillation threshold (%)
        },
        {
            "provider": "uphold-main",
            "currencyPairTicker": "BTC-EUR",
            "fetchInterval": 5000,
            "priceOscillationPercentage": 0.005
        },
        {
            "provider": "kraken-main",
            "currencyPairTicker": "XBTUSD",
            "fetchInterval": 2500,
            "priceOscillationPercentage": 0.01
        }
    ]
}
```

- **providers:** An object keyed by a user-chosen provider name.
  - **type:** One of the implemented provider types: `uphold`, `coinbase`, `kraken` or `binance`.
  - **url:** Optional. Overrides that provider's default endpoint (e.g. to point at a proxy or sandbox). If omitted, the provider's default base url is used.
- **currenciesToTrack:**
  - **provider:** The name of an entry in `providers`.
  - **currencyPairTicker:** Currency pair to monitor, passed through verbatim in the provider's own vocabulary (e.g. `BTC-USD` for Uphold/Coinbase, `XBTUSD` for Kraken, `BTCUSDT` for Binance). There is no translation between exchanges: `BTCUSDT` on Binance and `BTC-USD` on Uphold are different instruments with different prices.
  - **fetchInterval:** Fetch interval (ms).
  - **priceOscillationPercentage:** Minimum price change to trigger alert (as a percentage).

The bot refuses to start (logging why, and exiting non-zero) if a currency entry references a provider
name that is not in the registry, or if the same provider and ticker are tracked twice. The alert message
names the currency pair as `<provider>:<ticker>`, so the same asset tracked on two exchanges produces two
clearly distinguishable alerts.

## Architecture

- **src/analyzer/:** Price analysis and alerting logic.
  - ``PriceAnalyzer.js:`` Detects significant price changes.
  - ``AnalyzeManager.js:`` Manages analyzers for multiple pairs.
  - ``PriceAlert.js:`` Alert data structure.
- **src/backendConnection/:** Generic HTTP transport.
  - ``FetchData.js:`` HTTP GET, given a complete url, with timeout.
- **src/priceProvider/:** Per-exchange knowledge: building a ticker url and extracting an ask price.
  - ``UpholdProvider.js``, ``CoinbaseProvider.js``, ``KrakenProvider.js``, ``BinanceProvider.js``.
  - ``PriceProviderFactory.js:`` Maps a config `type` string to a provider class.
- **src/engine/:** Scheduling and orchestration.
  - ``Engine.js:`` Periodic task runner.
  - ``EngineManager.js:`` Manages multiple engines.
- **src/argumentParser/:** Argv argument parsing.
  - ``ArgumentParser.js:`` Parses argv data.
- **src/configLoader/:** Configuration loader.
  - ``ConfigLoader.js:`` Reads the configuration file and asserts the content.
- **src/botManager/:** Manages all the components of the bot.
  - ``BotManager.js:`` Instantiates every class and callback. Orchestrates the program.
- **src/main.js:** Entry point of the bot.

## Development

- Lint code:

```sh
npm run lint
```

- Testing:

Test Framework: Jest
Run all tests and get coverage report:

```sh
npm run test
```

## Example Output

``
New Price Alert 🚨 on uphold-main:BTC-USD! Price at: 109623.0791731246, variation of -0.0128% previous alert price: 109637.1122434467 with timestamp: 1757004000464
``

