import { CommandInteraction, Client } from "discord.js";
import { Command } from "../Command";
import {ApplicationCommandOptionType_STRING} from "./Language";
import {prisma} from "../../prisma";

export const Wish: Command = {
    name: "wish",
    description: "Wish for a card",
    type: 1, // Chat input
    run: async (client: Client, interaction: CommandInteraction) => {
        const data = interaction.options.data;
        if(data.length !== 1){
            await interaction.followUp({
                ephemeral: true,
                content: "Invalid cardId"
            });
            return;
        }
        console.assert(data[0].type === ApplicationCommandOptionType_STRING, "data[0].type === STRING")
        const cardid = data[0].value as string;
        const card = await prisma.card.findUnique({
            where: {
                cardId: cardid,
            },
            include: {
                cardI18n: true,
            }
        });
        if(card === null){
            await interaction.followUp({
                ephemeral: true,
                content: "Card not found"
            });
            return;
        }
        const prismaUser = await prisma.user.findUnique({
            where: {
                discordId: interaction.user.id,
            }
        });
        console.assert(prismaUser !== null, "prismaUser !== null")
        try{
            const wish = await prisma.wish.create({
                data: {
                    cardId: card.id,
                    userId: prismaUser!.id,
                    serverId: interaction.guildId!,
                }
            });
            await interaction.followUp({
                ephemeral: true,
                content: "Wish granted"
            });
        }
        catch (e: any){
            await interaction.followUp({
                ephemeral: true,
                content: "You already wished for this card"
            });
        }
    },
    options: [
        {
            name: "cardid",
            description: "CardId correspond to extension acronym - card number (e.g. sv02-001)",
            type: ApplicationCommandOptionType_STRING,
            required: true,
        },
    ],
};