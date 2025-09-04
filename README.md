# uphold-bot

## Currency Price Oscillation Bot

A Node.js bot that monitors currency price oscillations using the [Uphold API](https://uphold.com/en/developer/api/documentation/), and triggers alerts when price changes exceed a configurable threshold.

---

## Features

- **Monitors currency pairs** (e.g., BTC-USD) for price changes.
- **Configurable price oscillation threshold** for alerts.
- **Pluggable alert callback** (default: logs to console).
- **Modular, extensible architecture** (analyzers, engines, fetchers).
- **Tested with Jest** and includes unit tests.

---

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Architecture](#architecture)
- [Development](#development)

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

Start the bot with:

```sh
npm run start
```

To stop the bot the SIGINT signal (crtl+c) can be used.

By default, the bot will:

- Monitor the ``BTC-USD`` ticker from the Uphold API.
- Fetches the ticker's ask price every 5 seconds.
- Trigger an alert if the ask price changes by more than ``0.01%``.
- You can modify these settings in src/main.js.

## Configuration

Edit the following constants in src/main.js to customize:

```js
const cUpholdUrl = "https://api.uphold.com/v0/ticker/";
const cTickerToTrack = "BTC-USD";
const cEngineFrequency = 5000; // in ms
const cPriceVarianceThreshold = 0.01 / 100; // 0.01%
```

- **cUpholdUrl:** Uphold API endpoint.
- **cTickerToTrack:** Currency pair to monitor.
- **cEngineFrequency:** Fetch interval (ms).
- **cPriceVarianceThreshold:** Minimum price change to trigger alert (as a decimal).

## Architecture

- **src/analyzer/:** Price analysis and alerting logic.
  - ``PriceAnalyzer.js:`` Detects significant price changes.
  - ``AnalyzeManager.js:`` Manages analyzers for multiple pairs.
  - ``PriceAlert.js:`` Alert data structure.
- **src/backendConnection/:** Fetches data from Uphold API.
  - ``FetchData.js:`` HTTP GET with timeout.
- **src/engine/:** Scheduling and orchestration.
  - ``Engine.js:`` Periodic task runner.
  - ``EngineManager.js:`` Manages multiple engines.
- **src/main.js:** Entry point, wiring everything together.

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

```
New Price Alert 🚨 on BTC-USD! Price at: 109623.0791731246$, variation of -0.0128% previous alert price: 109637.1122434467$ with timestamp: 1757004000464
```
