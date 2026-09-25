import { UpholdProvider } from "./UpholdProvider.js";
import { CoinbaseProvider } from "./CoinbaseProvider.js";
import { KrakenProvider } from "./KrakenProvider.js";
import { BinanceProvider } from "./BinanceProvider.js";

/**
 * Factory responsible for mapping a config provider "type" string to
 * the concrete Price Provider class that implements it.
 */
export class PriceProviderFactory {

    /**
     * Creates a Price Provider instance for the given type.
     *
     * @param {string} pType
     *      The provider type, one of "uphold", "coinbase", "kraken" or "binance".
     * @param {string} pUrl
     *      An optional base url to override the provider's default endpoint.
     * @returns {object}
     *      The created Price Provider instance.
     */
    static createProvider(pType, pUrl) {
        switch (pType) {
            case "uphold":
                return new UpholdProvider(pUrl);
            case "coinbase":
                return new CoinbaseProvider(pUrl);
            case "kraken":
                return new KrakenProvider(pUrl);
            case "binance":
                return new BinanceProvider(pUrl);
            default:
                throw new Error("Unknown price provider type: " + pType);
        }
    }
}
