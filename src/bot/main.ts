import ready from "./listeners/ready";

require("dotenv").config();
import { Client } from "discord.js";
import interactionCreate from "./listeners/interactionCreate";


const token = process.env.DISCORD_TOKEN;
console.log("Bot is starting...");

const client = new Client({
    intents: []
});
ready(client);
interactionCreate(client);
client.login(token);
