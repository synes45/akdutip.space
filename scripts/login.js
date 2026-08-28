// scripts/login.js
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");
require("dotenv").config({ path: ".env.local" });

const apiId = parseInt(process.env.TELEGRAM_API_ID || "YOUR_API_ID");
const apiHash = process.env.TELEGRAM_API_HASH || "YOUR_API_HASH";
const stringSession = new StringSession("");

(async () => {
  console.log("Telegram hesabına bağlanılıyor...");
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await input.text("Telefon numaranız (+90...): "),
    password: async () => await input.text("2FA Parolanız (varsa): "),
    phoneCode: async () => await input.text("Telegram'a gelen onay kodu: "),
    onError: (err) => console.log(err),
  });

  console.log("\n✅ BAŞARILI! Session string'inizi kopyalayıp .env.local dosyanıza TELEGRAM_SESSION olarak yapıştırın:\n");
  console.log(client.session.save());
  process.exit(0);
})();