require("dotenv").config();
import { Client } from "discord.js";

const token = process.env.DISCORD_TOKEN;
console.log("Bot is starting...");

const client = new Client({
    intents: []
});
client.login(token);

console.log(client);
