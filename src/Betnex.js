import axios from "axios";
import { DEFAULT_CONFIG, ENDPOINTS } from "./constants.js";
import { BetnexError } from "./errors/BetnexError.js";

const SUPPORTED_HEADERS = ["x-betnex-key", "x-turnkeyxgaming-key"];

export class Betnex {
  constructor(apiKey, options = {}) {
    if (!apiKey || typeof apiKey !== "string") {
      throw new BetnexError("A valid API key is required");
    }

    this.apiKey = apiKey;

    this.config = {
      ...DEFAULT_CONFIG,
      debug: false,
      ...options,
    };

    this.validateConfig();

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        [this.config.headerName]: this.apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    this.setupInterceptors();
  }

  validateConfig() {
    if (!SUPPORTED_HEADERS.includes(this.config.headerName)) {
      throw new BetnexError(
        `Unsupported header name. Supported values: ${SUPPORTED_HEADERS.join(
          ", "
        )}`
      );
    }

    if (!this.config.baseUrl || typeof this.config.baseUrl !== "string") {
      throw new BetnexError("A valid baseUrl is required");
    }

    if (Number(this.config.timeout) <= 0) {
      throw new BetnexError("timeout must be greater than 0");
    }

    if (Number(this.config.retries) < 0) {
      throw new BetnexError("retries cannot be negative");
    }
  }

  setupInterceptors() {
    this.client.interceptors.request.use((config) => {
      if (this.config.debug) {
        console.log(
          `[Betnex SDK] ${config.method?.toUpperCase()} ${config.url}`
        );
      }

      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        throw new BetnexError(
          error?.response?.data?.message ||
            error?.response?.data?.msg ||
            error?.message ||
            "Betnex API Error",
          error?.response?.status,
          error?.response?.data
        );
      }
    );
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  validateRequired(payload, fields) {
    for (const field of fields) {
      if (
        payload[field] === undefined ||
        payload[field] === null ||
        payload[field] === ""
      ) {
        throw new BetnexError(`${field} is required`);
      }
    }
  }

  async request(callback) {
    let lastError;

    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        return await callback();
      } catch (error) {
        lastError = error;

        if (this.config.debug) {
          console.error(
            `[Betnex SDK] Attempt ${attempt} failed`,
            error.message
          );
        }

        if (attempt < this.config.retries) {
          await this.sleep(attempt * 1000);
        }
      }
    }

    throw lastError;
  }

  async getProviders() {
    return this.request(async () => {
      const { data } = await this.client.get(ENDPOINTS.PROVIDERS);

      return data;
    });
  }

  async getGames(provider) {
    if (!provider || typeof provider !== "string") {
      throw new BetnexError("provider must be a valid string");
    }

    return this.request(async () => {
      const { data } = await this.client.get(ENDPOINTS.GAMES, {
        params: {
          provider,
        },
      });

      return data;
    });
  }

  async launchGame(payload = {}) {
    this.validateRequired(payload, [
      "username",
      "gameId",
      "money",
      "platform",
      "home_url",
    ]);

    if (typeof payload.username !== "string") {
      throw new BetnexError("username must be a string");
    }

    if (typeof payload.gameId !== "string") {
      throw new BetnexError("gameId must be a string");
    }

    if (Number.isNaN(Number(payload.money))) {
      throw new BetnexError("money must be numeric");
    }

    if (!this.isValidUrl(payload.home_url)) {
      throw new BetnexError("home_url must be a valid URL");
    }

    const requestPayload = {
      username: payload.username,
      gameId: payload.gameId,
      money: Number(payload.money),
      platform: payload.platform,
      home_url: payload.home_url,

      ...(payload.currency && {
        currency: payload.currency,
      }),

      lang: payload.lang,
    };

    if (this.config.debug) {
      console.log("[Betnex SDK] Payload:", requestPayload);
    }

    return this.request(async () => {
      const { data } = await this.client.post(
        ENDPOINTS.GAME_URL,
        requestPayload
      );

      return data;
    });
  }

  getConfig() {
    return {
      ...this.config,
      apiKey: "***hidden***",
    };
  }

  setHeaderName(headerName) {
    if (!SUPPORTED_HEADERS.includes(headerName)) {
      throw new BetnexError(
        `Unsupported header name. Supported values: ${SUPPORTED_HEADERS.join(
          ", "
        )}`
      );
    }

    delete this.client.defaults.headers[this.config.headerName];

    this.config.headerName = headerName;

    this.client.defaults.headers[headerName] = this.apiKey;
  }
}
