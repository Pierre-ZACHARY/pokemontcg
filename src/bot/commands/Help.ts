import { CommandInteraction, Client } from "discord.js";
import { Command } from "../Command";
import {prisma} from "../../prisma";
import {getLang} from "../utils/getLang";

export const Help: Command = {
    name: "help",
    description: "Displays bots commands and their usage",
    descriptionLocalizations: {
        "fr": "Affiche les commandes du bot et leur utilisation",
    },
    type: 1, // Chat input
    run: async (client: Client, interaction: CommandInteraction) => {
        const prismaUserP = prisma.user.findUnique({
            where: {
                discordId: interaction.user.id
            }
        });
        const lang = getLang((await prismaUserP)?.language ?? "en");
        const content = lang.helpMessage;

        await interaction.followUp({
            ephemeral: true,
            content
        });
    }
};