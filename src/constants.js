export const DEFAULT_CONFIG = {
  baseUrl: "https://livecasinoapi.betnex.co/casino",
  timeout: 10000,
  retries: 3,

  // Default authentication header
  headerName: "x-betnex-key",

  // Supported headers
  supportedHeaders: ["x-betnex-key"],
};

export const ENDPOINTS = {
  PROVIDERS: "/getallproviders",
  GAMES: "/getallgamesandprovider",
  GAME_URL: "/getgameurl",
  FILTER_PROVIDERS: "/filterproviders",
  FILTER_GAMES: "/filtergames",
};
