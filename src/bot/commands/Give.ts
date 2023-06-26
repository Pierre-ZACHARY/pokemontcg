import { CommandInteraction, Client } from "discord.js";
import { Command } from "../Command";
import {ApplicationCommandOptionType_USER} from "./Collection";
import {ApplicationCommandOptionType_STRING} from "./Language";
import {prisma} from "../../prisma";

export const Give: Command = {
    name: "give",
    description: "give a card to someone",
    type: 1, // Chat input
    run: async (client: Client, interaction: CommandInteraction) => {
        const data = interaction.options.data;
        if(data.length !== 2){
            await interaction.followUp({
                ephemeral: true,
                content: "Invalid parameters"
            });
            return;
        }
        console.assert(data[0].type === ApplicationCommandOptionType_STRING, "data[0].type === STRING")
        const cardid = data[0].value as string;
        const card = await prisma.card.findFirst({
            where: {
                cardId: cardid,
                collections: {
                    some: {
                        user:{
                            discordId: interaction.user.id,
                        },
                    }
                }
            },
            include: {
                cardI18n: true,
                collections: {
                    include: {
                        user: true,
                    }
                },
            }
        });
        if(!card){
            await interaction.followUp({
                ephemeral: true,
                content: "You don't have this card"
            });
            return;
        }
        console.assert(data[1].type === ApplicationCommandOptionType_USER, "data[1].type === USER");
        const user = data[1].value as string;
        if(user === interaction.user.id){
            await interaction.followUp({
                ephemeral: true,
                content: "You can't give yourself a card"
            });
            return;
        }
        const discordUser = await client.users.fetch(user);
        console.assert(discordUser !== null, "discordUser !== null");
        if(!discordUser){
            await interaction.followUp({
                ephemeral: true,
                content: "User not found"
            });
            return;
        }
        const collection = await prisma.collection.update({
            where: {
                cardId_serverId: {
                    cardId: card.id,
                    serverId: interaction.guildId!,
                },
            },
            data: {
                user: {
                    connect: {
                        discordId: user,
                    }
                }
            }
        });
        if(!collection){
            await interaction.followUp({
                ephemeral: true,
                content: "User doesn't have this card"
            });
            return;
        }


        const content = ""+discordUser.tag+" received "+card.cardI18n[0].name+" from "+interaction.user.tag+"";

        await interaction.followUp({
            ephemeral: true,
            content
        });
    },
    options: [
        {
            name: "cardid",
            description: "CardId to give",
            type: ApplicationCommandOptionType_STRING,
            required: true,
        },
        {
            name: "user",
            description: "@ user to give the card",
            type: ApplicationCommandOptionType_USER,
            required: true,
        },
    ],
};