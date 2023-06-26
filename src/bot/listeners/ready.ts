import { Client } from "discord.js";
import {Commands} from "../Command";
import {prisma} from "../../prisma";

export default (client: Client): void => {
    client.on("ready", async () => {
        if (!client.user || !client.application) {
            return;
        }
        await client.application.commands.set(Commands);

        console.log(`${client.user.username} is online`);

       //let cards = await prisma.card.findMany();
        //console.log(cards);
    });
};