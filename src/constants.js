export const DEFAULT_CONFIG = {
  baseUrl: "http://livecasinoapi.betnex.co:8011/casino",
  timeout: 10000,
  retries: 3,

  // Default authentication header
  headerName: "x-betnex-key",

  // Supported headers
  supportedHeaders: ["x-betnex-key", "x-turnkeyxgaming-key"],
};

export const ENDPOINTS = {
  PROVIDERS: "/getallproviders",
  GAMES: "/getallgamesandprovider",
  GAME_URL: "/getgameurl",
};
