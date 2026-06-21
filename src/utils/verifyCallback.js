import { BetnexError } from "../errors/BetnexError.js";

export function verifyCallback(payload, expectedApiKey = null) {
  if (!payload || typeof payload !== "object") {
    throw new BetnexError("Callback payload is required");
  }

  const requiredFields = [
    "bet_amount",
    "win_amount",
    "member_account",
    "game_uid",
    "game_round",
    "serial_number",
    "currency_code",
    "api_key",
    "game_name",
    "game_provider",
  ];

  for (const field of requiredFields) {
    if (
      payload[field] === undefined ||
      payload[field] === null ||
      payload[field] === ""
    ) {
      throw new BetnexError(`${field} is required`);
    }
  }

  // Numeric validation
  if (Number.isNaN(Number(payload.bet_amount))) {
    throw new BetnexError("bet_amount must be numeric");
  }

  if (Number.isNaN(Number(payload.win_amount))) {
    throw new BetnexError("win_amount must be numeric");
  }

  // String validation
  const stringFields = [
    "member_account",
    "game_uid",
    "game_round",
    "serial_number",
    "currency_code",
    "api_key",
    "game_name",
    "game_provider",
  ];

  for (const field of stringFields) {
    if (typeof payload[field] !== "string") {
      throw new BetnexError(`${field} must be a string`);
    }
  }

  // API Key Validation
  if (expectedApiKey && String(payload.api_key) !== String(expectedApiKey)) {
    throw new BetnexError("Invalid callback api_key");
  }

  return {
    valid: true,
    ...payload,
  };
}
