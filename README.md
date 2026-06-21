# Betnex Casino API SDK

> **The fastest way to integrate casino games into your platform — in as little as 30 minutes.**

[![npm](https://img.shields.io/npm/v/@betnex/sdk)](https://www.npmjs.com/package/@betnex/sdk)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Support](https://img.shields.io/badge/support-24h-brightgreen.svg)](mailto:contact@betnex.co)

---

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Installation & Setup](#installation--setup)
- [API Client](#api-client)
- [Core API Methods](#core-api-methods)
- [Callback Integration](#callback-integration)
- [SDK Utilities](#sdk-utilities)
- [Configuration Reference](#configuration-reference)
- [Environments](#environments)
- [Production Checklist](#production-checklist)
- [Support](#support)

---

## Overview

The **Betnex SDK** provides a simple, reliable interface to integrate hundreds of casino games from top providers into your platform. The entire integration requires only **3 API calls** and **1 webhook endpoint**.

```
Get Providers → Get Games → Launch Game → Handle Callbacks
```

**Typical integration time: 30 minutes to 2 hours.**

---

## Quick Start

### 1. Get an API Key

Register your operator account at **[casinoapi.betnex.co](https://casinoapi.betnex.co)** and generate a Test API Key directly from the dashboard.

> For Production access, provider activation, commercial agreements, and enterprise plans, contact [contact@betnex.co](mailto:contact@betnex.co).

### 2. Install the SDK

```bash
npm install @betnex/sdk
```

### 3. Run Your First Integration

```javascript
import { Betnex } from "@betnex/sdk";

const api = new Betnex(process.env.BETNEX_API_KEY);

// Step 1: Get providers
const providers = await api.getProviders();

// Step 2: Get games for a provider
const games = await api.getGames("SPRIBE");

// Step 3: Launch a game
const launch = await api.launchGame({
  username: "player123",
  gameId: "a04d1f3eb8ccec8a4823bdf18e3f0e84",
  money: 1000,
  platform: 1,
  currency: "INR",
  home_url: "https://yourdomain.com",
  lang: "en",
});

// Redirect the player
window.location.href = launch.payload.game_launch_url;
```

---

## Installation & Setup

### Install

```bash
npm install @betnex/sdk
```

### Environment Variables

Store your API key securely using environment variables:

```bash
# .env
BETNEX_API_KEY=your_api_key_here
```

### Import

```javascript
import {
  Betnex,
  BetnexError,
  verifyCallback,
  calculateBalance,
  createCallbackResponse,
} from "@betnex/sdk";
```

---

## API Client

### Basic Usage

```javascript
import { Betnex } from "@betnex/sdk";

const api = new Betnex(process.env.BETNEX_API_KEY);
```

### Advanced Configuration

```javascript
const api = new Betnex(process.env.BETNEX_API_KEY, {
  timeout: 10000, // Request timeout in ms (default: 10000)
  retries: 1, // Number of retries on failure
  debug: false, // Enable debug logging (disable in production)
  headerName: "x-betnex-key", // Authentication header name
});
```

### Authentication Headers

Betnex supports two authentication header names — use whichever fits your setup:

| Header                 | Description        |
| ---------------------- | ------------------ |
| `x-betnex-key`         | Default header     |
| `x-turnkeyxgaming-key` | Alternative header |

```javascript
const api = new Betnex(process.env.BETNEX_API_KEY, {
  headerName: "x-turnkeyxgaming-key",
});
```

### Debug Logging

Enable debug logs during development to inspect all API calls:

```javascript
const api = new Betnex(process.env.BETNEX_API_KEY, { debug: true });
```

Example output:

```
[Betnex SDK] GET /getallproviders      → Response 200
[Betnex SDK] GET /getallgamesandprovider → Response 200
[Betnex SDK] POST /getgameurl          → Response 200
```

> **Always disable debug mode in production.**

---

## Core API Methods

### `getProviders()`

Retrieve all available game providers.

```javascript
const providers = await api.getProviders();
```

---

### `getGames(providerName)`

Retrieve all games for a specific provider.

```javascript
const games = await api.getGames("SPRIBE");
```

| Parameter      | Type     | Description                               |
| -------------- | -------- | ----------------------------------------- |
| `providerName` | `string` | The provider identifier (e.g. `"SPRIBE"`) |

---

### `launchGame(options)`

Generate a secure, time-limited game launch URL for a player.

```javascript
const launch = await api.launchGame({
  username: "player123",
  gameId: "a04d1f3eb8ccec8a4823bdf18e3f0e84",
  money: 1000,
  platform: 1,
  currency: "INR",
  home_url: "https://yourdomain.com",
  lang: "en",
});

// Redirect player to the game
window.location.href = launch.payload.game_launch_url;
```

**Options:**

| Parameter  | Type     | Required | Description                           |
| ---------- | -------- | -------- | ------------------------------------- |
| `username` | `string` | ✅       | Unique player identifier              |
| `gameId`   | `string` | ✅       | Game UID from `getGames()`            |
| `money`    | `number` | ✅       | Player's current balance              |
| `platform` | `number` | ✅       | `1` = desktop, `2` = mobile           |
| `currency` | `string` | ✅       | Currency code (e.g. `"INR"`, `"USD"`) |
| `home_url` | `string` | ✅       | URL to redirect on game exit          |
| `lang`     | `string` | ✅       | Language code (e.g. `"en"`)           |

---

## Callback Integration

Betnex uses **server-to-server callbacks** to synchronize player balances in real time.

Whenever a player places a bet, receives winnings, or completes a game round, Betnex sends a `POST` request to your registered callback URL.

### Requirements

Your callback endpoint must:

- Accept `POST` requests
- Return JSON responses
- Be publicly accessible
- Use HTTPS in production
- Process requests quickly
- Handle duplicate transactions safely using `serial_number`

### Example Callback URL

```text
https://yourdomain.com/api/betnex/callback
```

---

## Complete Express.js Example

```javascript
import express from "express";
import {
  verifyCallback,
  calculateBalance,
  createCallbackResponse,
} from "@betnex/sdk";

const app = express();

app.use(express.json());
app.post(
  "/api/betnex/callback",

  async (req, res) => {
    try {
      // Validate callback payload

      const callback = verifyCallback(
        req.body,

        process.env.BETNEX_API_KEY
      );

      const {
        bet_amount,

        win_amount,

        member_account,

        game_uid,

        game_round,

        serial_number,

        currency_code,

        game_name,

        game_provider,

        data,
      } = callback;

      const username = member_account

        .toLowerCase()

        .trim();

      const betAmount = Number(bet_amount);

      const winAmount = Number(win_amount);

      // Find player

      const user = await User.findOne(
        {
          username,
        },

        {
          balance: 1,

          manager: 1,

          musername: 1,
        }
      );

      if (!user) {
        return res.json(
          createCallbackResponse({
            success: false,

            handle: false,

            msg: "User not found",
          })
        );
      }

      // Create or update game round record

      const betUpdate = await BetModal.updateOne(
        {
          provider: game_provider,

          userusername: username,

          game_round,

          processed_serials: {
            $ne: serial_number,
          },
        },

        {
          $setOnInsert: {
            manager: user.manager,

            musername: user.musername,

            userusername: username,

            game_uid,

            game_name,

            provider: game_provider,

            game_round,

            currency_code,

            ...(data != null && {
              data,
            }),
          },

          $set: {
            serial_number,
          },

          $inc: {
            betAmount,

            winAmount,
          },

          $addToSet: {
            processed_serials: serial_number,
          },
        },

        {
          upsert: true,
        }
      );

      // Duplicate callback

      if (betUpdate.modifiedCount === 0 && betUpdate.upsertedCount === 0) {
        return res.json(
          createCallbackResponse({
            success: true,

            handle: true,

            money: user.balance,

            msg: "Duplicate callback ignored",
          })
        );
      }

      // Calculate balance change

      const balanceChange = -betAmount + winAmount;

      // Update player balance

      const updatedUser = await User.findOneAndUpdate(
        {
          username,
        },

        {
          $inc: {
            balance: balanceChange,
          },
        },

        {
          returnDocument: "after",
        }
      );

      if (!updatedUser) {
        throw new Error("User balance update failed");
      }

      // Success response

      return res.json(
        createCallbackResponse({
          success: true,

          handle: true,

          money: updatedUser.balance,

          msg: "Callback processed successfully",
        })
      );
    } catch (error) {
      return res.json(
        createCallbackResponse({
          success: false,

          handle: false,

          money: 0,

          msg: error.message,
        })
      );
    }
  }
);
```

### Why This Approach?

- Uses `game_round` as the primary game identifier.

- Prevents duplicate processing using `processed_serials`.

- Merges multiple callbacks into a single game round record.

- Supports Aviator, Crash Games, Slots, Fishing Games, and Live Casino.

- Maintains a complete transaction history.

- Supports high-volume casino traffic.

- Reduces database records by aggregating round data.

- Makes GGR calculations easier.

- Improves reconciliation and reporting.

app.listen(3000);

````

---

## Callback Request Payload

```json
{
  "bet_amount": 100,
  "win_amount": 250,
  "member_account": "player123",
  "game_uid": "75f81c56565d394503f544f3431ef370",
  "game_round": "12602252614078837658",
  "serial_number": "TXN123456",
  "currency_code": "INR",
  "api_key": "operator_id",
  "game_name": "Aviator",
  "game_provider": "SPRIBE",
  "data": {}
}
````

### Field Description

| Field          | Description                       |
| -------------- | --------------------------------- |
| bet_amount     | Amount wagered by player          |
| win_amount     | Amount won by player              |
| member_account | Unique player username            |
| game_uid       | Unique game identifier            |
| game_round     | Unique round identifier           |
| serial_number  | Unique transaction identifier     |
| currency_code  | Player currency                   |
| api_key        | Operator identifier               |
| game_name      | Game name                         |
| game_provider  | Provider name                     |
| data           | Additional provider-specific data |

---

## Callback Response Format

```json
{
  "success": true,
  "handle": true,
  "money": 1150,
  "msg": "Success"
}
```

### Response Fields

| Field   | Description                    |
| ------- | ------------------------------ |
| success | Request processed successfully |
| handle  | Transaction handled            |
| money   | Updated player balance         |
| msg     | Response message               |

---

## Using SDK Helpers

### Verify Callback

```javascript
import { verifyCallback } from "@betnex/sdk";

const callback = verifyCallback(req.body, process.env.BETNEX_API_KEY);
```

### Calculate Balance

```javascript
import { calculateBalance } from "@betnex/sdk";

const newBalance = calculateBalance(1000, 100, 250);

console.log(newBalance);

// 1150
```

### Create Callback Response

```javascript
import { createCallbackResponse } from "@betnex/sdk";

return res.json(
  createCallbackResponse({
    success: true,
    handle: true,
    money: 1150,
    msg: "Success",
  })
);
```

---

## Balance Calculation

```text
Current Balance = 1000

Bet Amount = 100

Win Amount = 250

New Balance = 1000 - 100 + 250

Result = 1150
```

---

## Important Notes

- Always store `serial_number` to prevent duplicate transactions.
- Always return the latest player balance in the `money` field.
- Validate every callback request.
- Use HTTPS in production.
- Keep callback processing idempotent.
- Never expose internal errors in production responses.
- Respond within a few seconds to avoid provider timeouts.

---

## SDK Utilities

### `verifyCallback(body, apiKey)`

Validates the integrity and authenticity of an incoming callback request.

```javascript
import { verifyCallback } from "@betnex/sdk";

const callback = verifyCallback(req.body, process.env.BETNEX_API_KEY);
```

---

### `calculateBalance(current, bet, win)`

Computes the new player balance after a round.

```
newBalance = currentBalance - betAmount + winAmount
```

```javascript
import { calculateBalance } from "@betnex/sdk";

// Example: balance=1000, bet=100, win=250 → result=1150
const newBalance = calculateBalance(1000, 100, 250);
```

---

### `createCallbackResponse(money, options?)`

Generates a properly formatted callback response object.

```javascript
import { createCallbackResponse } from "@betnex/sdk";

const response = createCallbackResponse(1150);
// { success: true, handle: true, money: 1150, msg: "Success" }

return res.json(response);
```

---

### `BetnexError`

All SDK errors extend `BetnexError` for consistent error handling:

```javascript
import { Betnex, BetnexError } from "@betnex/sdk";

try {
  const launch = await api.launchGame({
    /* ... */
  });
} catch (err) {
  if (err instanceof BetnexError) {
    console.error("Betnex API error:", err.message);
  }
}
```

---

## Available Exports

| Export                   | Type     | Description                       |
| ------------------------ | -------- | --------------------------------- |
| `Betnex`                 | Class    | Main API client                   |
| `BetnexError`            | Class    | SDK error class                   |
| `verifyCallback`         | Function | Validates incoming callbacks      |
| `calculateBalance`       | Function | Calculates updated player balance |
| `createCallbackResponse` | Function | Builds a valid callback response  |

---

## Configuration Reference

| Option       | Type      | Default          | Description                       |
| ------------ | --------- | ---------------- | --------------------------------- |
| `timeout`    | `number`  | `10000`          | Request timeout in milliseconds   |
| `retries`    | `number`  | `1`              | Retry attempts on network failure |
| `debug`      | `boolean` | `false`          | Enable verbose SDK logs           |
| `headerName` | `string`  | `"x-betnex-key"` | Authentication header name        |

---

## Environments

### Test Environment

- Generate a Test API Key at [casinoapi.betnex.co](https://casinoapi.betnex.co) — no commercial agreement required.
- Designed for integration testing, callback testing, wallet validation, launch URL validation, and provider verification.

### Production Environment

Production access requires:

- Completed integration with all tests passing
- Callback URL verified and publicly accessible
- Signed commercial agreement
- Provider access approval

To request production access: [contact@betnex.co](mailto:contact@betnex.co)

---

## Production Checklist

Use this checklist before going live:

- [ ] API Key received and stored securely in environment variables
- [ ] Callback URL configured and publicly accessible
- [ ] HTTPS enabled on callback endpoint
- [ ] `verifyCallback` implemented to validate requests
- [ ] Duplicate transaction protection in place (check `serial_number`)
- [ ] Balance synchronization tested end-to-end
- [ ] Game launch URL tested on desktop and mobile
- [ ] Provider access verified
- [ ] Debug mode disabled (`debug: false`)

---

## Support

| Resource         | Link                                                                      |
| ---------------- | ------------------------------------------------------------------------- |
| 🌐 Dashboard     | [casinoapi.betnex.co](https://casinoapi.betnex.co)                        |
| 📄 Documentation | [betnexcasinoapidocs.tiiny.site](https://betnexcasinoapidocs.tiiny.site/) |
| 📧 Email         | [contact@betnex.co](mailto:contact@betnex.co)                             |

**Typical response time: within 24 hours.**
Enterprise customers receive priority support.
