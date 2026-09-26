import axios from "axios";
import { DEFAULT_CONFIG, ENDPOINTS } from "./constants.js";
import { BetnexError } from "./errors/BetnexError.js";

const AUTH_HEADER = "x-betnex-key";
const SUPPORTED_HEADERS = [AUTH_HEADER];
let bannerShown = false;

// ── Terminal styling ─────────────────────────────────────────
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

const W = 62;

function pad(text, width) {
  const visibleLen = text.replace(/\x1b\[[0-9;]*m/g, "").length;
  return text + " ".repeat(Math.max(0, width - visibleLen));
}

function row(content = "", opts = {}) {
  const { center = false, indent = 2 } = opts;
  const stripped = content.replace(/\x1b\[[0-9;]*m/g, "");
  const inner = W - 2;
  let line;
  if (center) {
    const total = inner - stripped.length;
    const left = Math.floor(total / 2);
    const right = total - left;
    line = " ".repeat(left) + content + " ".repeat(right);
  } else {
    line = " ".repeat(indent) + pad(content, inner - indent);
  }
  console.log(`${c.cyan}║${c.reset}${line}${c.cyan}║${c.reset}`);
}

function divider() {
  console.log(`${c.cyan}╠${"═".repeat(W)}╣${c.reset}`);
}

function blank() {
  row();
}

function section(label) {
  const inner = W - 2;
  const stripped = label.replace(/\x1b\[[0-9;]*m/g, "");
  const right = inner - 2 - stripped.length;
  console.log(
    `${c.cyan}╟─${c.reset}${label}${"─".repeat(Math.max(0, right))}${c.cyan}╢${
      c.reset
    }`
  );
}

function showBanner() {
  console.log(`\n${c.cyan}╔${"═".repeat(W)}╗${c.reset}`);

  blank();
  row(
    `${c.bold}${c.yellow}  ✦  ${c.reset}` +
      `${c.bold}${c.white}BETNEX${c.reset}` +
      `${c.dim}${c.white} SDK${c.reset}` +
      `${c.bold}${c.yellow}  ✦${c.reset}`,
    { center: true }
  );
  row(
    `${c.dim}${c.cyan}@betnex/sdk${c.reset}` +
      `${c.dim}  ·  initialized successfully${c.reset}`,
    { center: true }
  );
  blank();

  row(
    `${c.green}✔${c.reset}  ${c.white}SDK Initialized Successfully${c.reset}`,
    { indent: 3 }
  );
  blank();

  // ── Dashboard ──────────────────────────────────────────────
  section(`${c.bold}${c.cyan} DASHBOARD ${c.reset}${c.cyan}`);
  blank();
  row(
    `${c.dim}   🌐  ${c.reset}${c.bold}${c.cyan}https://casinoapi.betnex.co${c.reset}`,
    { indent: 0 }
  );
  blank();

  // ── Support ────────────────────────────────────────────────
  section(`${c.bold}${c.cyan} SUPPORT ${c.reset}${c.cyan}`);
  blank();
  row(
    `${c.dim}   📧  ${c.reset}${c.bold}${c.white}Production Access & Support${c.reset}`,
    { indent: 0 }
  );
  row(`${c.dim}       ${c.cyan}contact@betnex.co${c.reset}`, { indent: 0 });
  blank();

  divider();
  blank();
  row(
    `${c.dim}Built with ${c.reset}${c.red}♥${c.reset}${c.dim}  ·  Happy Coding  ·  ${c.reset}${c.cyan}betnex.co${c.reset}`,
    { center: true }
  );
  blank();
  console.log(`${c.cyan}╚${"═".repeat(W)}╝${c.reset}\n`);
}
// ─────────────────────────────────────────────────────────────

export class Betnex {
  constructor(apiKey, options = {}) {
    if (!apiKey || typeof apiKey !== "string") {
      throw new BetnexError("A valid API key is required");
    }
    if (!bannerShown) {
      bannerShown = true;
      showBanner();
    }

    this.apiKey = apiKey;

    this.config = {
      ...DEFAULT_CONFIG,
      debug: false,
      ...options,
    };

    // Normalize baseUrl: strip trailing slashes so endpoint joins are clean.
    // New production base: https://livecasinoapi.betnex.co/casino
    if (typeof this.config.baseUrl === "string") {
      this.config.baseUrl = this.config.baseUrl.replace(/\/+$/, "");
    }

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
    if (this.config.headerName !== AUTH_HEADER) {
      throw new BetnexError(
        `Unsupported header name. Only "${AUTH_HEADER}" is supported`
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
    if (!provider || typeof provider !== "string" || !provider.trim()) {
      throw new BetnexError("provider must be a valid string");
    }

    return this.request(async () => {
      const { data } = await this.client.get(ENDPOINTS.GAMES, {
        params: {
          provider: provider.trim(),
        },
      });

      return data;
    });
  }

  async getFilteredProviders({ currency, lang } = {}) {
    if (
      currency !== undefined &&
      currency !== null &&
      currency !== "" &&
      (typeof currency !== "string" ||
        !/^[A-Za-z]{3,4}$/.test(currency.trim()))
    ) {
      throw new BetnexError(
        "currency must be an ISO code like 'INR' or 'USDT'"
      );
    }

    if (
      lang !== undefined &&
      lang !== null &&
      lang !== "" &&
      typeof lang !== "string"
    ) {
      throw new BetnexError("lang must be a string");
    }

    return this.request(async () => {
      const { data } = await this.client.get(ENDPOINTS.FILTER_PROVIDERS, {
        params: {
          ...(currency
            ? { currency: String(currency).trim().toUpperCase() }
            : {}),
          ...(lang ? { lang: String(lang).trim() } : {}),
        },
      });

      return data;
    });
  }

  async getFilteredGames({ providercode, currency, lang } = {}) {
    if (
      !providercode ||
      typeof providercode !== "string" ||
      !providercode.trim()
    ) {
      throw new BetnexError("providercode must be a valid string");
    }

    if (
      currency !== undefined &&
      currency !== null &&
      currency !== "" &&
      (typeof currency !== "string" ||
        !/^[A-Za-z]{3,4}$/.test(currency.trim()))
    ) {
      throw new BetnexError(
        "currency must be an ISO code like 'INR' or 'USDT'"
      );
    }

    if (
      lang !== undefined &&
      lang !== null &&
      lang !== "" &&
      typeof lang !== "string"
    ) {
      throw new BetnexError("lang must be a string");
    }

    return this.request(async () => {
      const { data } = await this.client.get(ENDPOINTS.FILTER_GAMES, {
        params: {
          providercode: providercode.trim(),
          ...(currency
            ? { currency: String(currency).trim().toUpperCase() }
            : {}),
          ...(lang ? { lang: String(lang).trim() } : {}),
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

    if (payload.username !== payload.username.toLowerCase()) {
      throw new BetnexError("username must be in lowercase only");
    }

    if (!/^[a-z0-9]{4,32}$/.test(payload.username)) {
      throw new BetnexError(
        "username must be alphanumeric and 4-32 characters long"
      );
    }

    if (typeof payload.gameId !== "string") {
      throw new BetnexError("gameId must be a string");
    }

    if (Number.isNaN(Number(payload.money))) {
      throw new BetnexError("money must be numeric");
    }

    if (typeof payload.money !== "number") {
      throw new BetnexError("money must be a number");
    }

    if (![1, 2].includes(payload.platform)) {
      throw new BetnexError("platform must be 1 (web) or 2 (H5)");
    }

    if (!this.isValidUrl(payload.home_url)) {
      throw new BetnexError("home_url must be a valid URL");
    }

    if (
      payload.currency !== undefined &&
      payload.currency !== null &&
      payload.currency !== "" &&
      (typeof payload.currency !== "string" ||
        !/^[A-Za-z]{3,4}$/.test(payload.currency.trim()))
    ) {
      throw new BetnexError(
        "currency must be an ISO code like 'INR' or 'USDT' (omit it on single-currency STARTER/STANDARD/ENTERPRISE plans)"
      );
    }

    if (
      payload.extras !== undefined &&
      payload.extras !== null &&
      typeof payload.extras !== "string"
    ) {
      throw new BetnexError("extras must be a string if provided");
    }

    if (typeof payload.extras === "string" && payload.extras.length > 100) {
      throw new BetnexError("extras string too long (max 100 chars)");
    }

    if (
      payload.callback_url !== undefined &&
      payload.callback_url !== null &&
      payload.callback_url !== ""
    ) {
      if (
        typeof payload.callback_url !== "string" ||
        !/^https?:\/\//i.test(payload.callback_url) ||
        !this.isValidUrl(payload.callback_url)
      ) {
        throw new BetnexError(
          "callback_url must be a valid URL starting with http:// or https://"
        );
      }
    }

    const requestPayload = {
      username: payload.username,
      gameId: payload.gameId,
      money: Number(payload.money),
      platform: payload.platform,
      home_url: payload.home_url,

      ...(payload.currency && {
        currency: String(payload.currency).trim().toUpperCase(),
      }),

      lang: payload.lang || "en",

      ...(payload.extras ? { extras: payload.extras.trim() } : {}),
      ...(payload.callback_url
        ? { callback_url: payload.callback_url }
        : {}),
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
    if (headerName !== AUTH_HEADER) {
      throw new BetnexError(
        `Unsupported header name. Only "${AUTH_HEADER}" is supported`
      );
    }

    delete this.client.defaults.headers[this.config.headerName];

    this.config.headerName = headerName;

    this.client.defaults.headers[headerName] = this.apiKey;
  }
}
