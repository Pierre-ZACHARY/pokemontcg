import {Guild, User} from "discord.js";
import {prisma} from "../../prisma";
import {updateShop} from "./updateShop";

export async function serverGuard(guild: Guild){
    const server = await prisma.server.upsert({
        where: {
            discordId: guild.id
        },
        update: {},
        create: {
            discordId: guild.id,
            shop:{
                create: {}
            }
        }
    });
}