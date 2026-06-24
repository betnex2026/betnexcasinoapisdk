// import {
//   Betnex,
//   verifyCallback,
//   calculateBalance,
//   createCallbackResponse,
// } from "@betnex/sdk";

// const api = new Betnex(process.env.BETNEX_API_KEY, {
//   headerName: "x-betnex-key",
//   debug: true,
// });

// async function main() {
//   try {
//     console.log("\n==============================");
//     console.log("GET PROVIDERS");
//     console.log("==============================\n");

//     const providers = await api.getProviders();
//     console.log(providers);

//     console.log("\n==============================");
//     console.log("GET GAMES");
//     console.log("==============================\n");

//     const games = await api.getGames("SPRIBE");

//     console.log(`Total Games: ${games.totalGames}`);

//     if (games.games?.length) {
//       console.log("First Game:");
//       console.log(games.games[0]);
//     }

//     console.log("\n==============================");
//     console.log("LAUNCH GAME");
//     console.log("==============================\n");

//     const launch = await api.launchGame({
//       username: "testuserking",
//       gameId: games.games[0].id,
//       money: 1000,
//       platform: 1,
//       currency: "INR",
//       home_url: "https://google.com",
//       lang: "en",
//     });

//     console.log(launch);

//     console.log("\n==============================");
//     console.log("CALLBACK VALIDATION EXAMPLE");
//     console.log("==============================\n");

//     const callbackPayload = {
//       bet_amount: 100,
//       win_amount: 0,
//       member_account: "testuser",
//       game_uid: "a04d1f3eb8ccec8a4823bdf18e3f0e84",
//       game_round: "9356359715438476370",
//       serial_number: "955fbea9-6cd0-356c-8302-7326fa647c6d",
//       currency_code: "INR",
//       api_key: process.env.BETNEX_API_KEY,
//       game_name: "AVIATOR",
//       game_provider: "SPRIBE",
//     };

//     const callback = verifyCallback(
//       callbackPayload,
//       process.env.BETNEX_API_KEY
//     );

//     console.log("Callback Verified:");
//     console.log(callback);

//     const currentBalance = 1000;

//     const newBalance = calculateBalance(
//       currentBalance,
//       callback.bet_amount,
//       callback.win_amount
//     );

//     console.log("\nCalculated Balance:", newBalance);

//     const response = createCallbackResponse({
//       success: true,
//       handle: true,
//       money: newBalance,
//       msg: "Callback processed successfully",
//     });

//     console.log("\nCallback Response:");
//     console.log(response);
//   } catch (error) {
//     console.error("\nSDK Error:");
//     console.error(error);
//   }
// }

// main();

const {
  Betnex,
  verifyCallback,
  calculateBalance,
  createCallbackResponse,
} = require("@betnex/sdk");

const apiKey = process.env.BETNEX_API_KEY;

const api = new Betnex(apiKey, {
  headerName: "x-betnex-key",
  debug: false,
});

async function main() {
  try {
    console.log("\n==============================");
    console.log("GET PROVIDERS");
    console.log("==============================\n");

    const providers = await api.getProviders();
    console.log(providers);

    console.log("\n==============================");
    console.log("GET GAMES");
    console.log("==============================\n");

    const games = await api.getGames("SPRIBE");

    console.log(`Total Games: ${games.totalGames}`);

    if (games.games?.length) {
      console.log("First Game:");
      console.log(games.games[0]);
    }

    console.log("\n==============================");
    console.log("LAUNCH GAME");
    console.log("==============================\n");

    const launch = await api.launchGame({
      username: "testuserking",
      gameId: games.games[0].id,
      money: 1000,
      platform: 1,
      currency: "INR",
      home_url: "https://google.com",
      lang: "en",
    });

    console.log(launch);

    console.log("\n==============================");
    console.log("CALLBACK VALIDATION EXAMPLE");
    console.log("==============================\n");

    const callbackPayload = {
      bet_amount: 100,
      win_amount: 0,
      member_account: "testuser",
      game_uid: "a04d1f3eb8ccec8a4823bdf18e3f0e84",
      game_round: "9356359715438476370",
      serial_number: "955fbea9-6cd0-356c-8302-7326fa647c6d",
      currency_code: "INR",
      api_key: apiKey,
      game_name: "AVIATOR",
      game_provider: "SPRIBE",
    };

    const callback = verifyCallback(callbackPayload, apiKey);

    console.log("Callback Verified:");
    console.log(callback);

    const newBalance = calculateBalance(
      1000,
      callback.bet_amount,
      callback.win_amount
    );

    console.log("\nCalculated Balance:", newBalance);

    const response = createCallbackResponse({
      success: true,
      handle: true,
      money: newBalance,
      msg: "Callback processed successfully",
    });

    console.log("\nCallback Response:");
    console.log(response);
  } catch (error) {
    console.error("\nSDK Error:");
    console.error(error);
  }
}

main();
