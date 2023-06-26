import {CommandInteraction, Client, ApplicationCommandOptionBase, ApplicationCommandOptionData} from "discord.js";
import { Command } from "../Command";
import {prisma} from "../../prisma";

export const ApplicationCommandOptionType_STRING = 3;

export const Language: Command = {
    name: "language",
    description: "Change the language of the bot",
    type: 1, // Chat input
    run: async (client: Client, interaction: CommandInteraction) => {
        const data = interaction.options.data;
        console.assert(data.length === 1, "data.length === 1")
        console.assert(data[0].type === ApplicationCommandOptionType_STRING, "data[0].type === STRING")
        const lang = data[0].value as string;
        console.assert(lang === "fr" || lang === "en", "lang === fr || lang === en")

        const content = lang === "en" ? "Bot language has been changed to English" : "La langue du bot a été changée en Français";
        await Promise.all([interaction.followUp({
            ephemeral: true,
            content
        }), prisma.user.update({
            where: {
                discordId: interaction.user.id,
            },
            data: {
                language: lang as string,
            }
        })]);
    },
    options: [
        {
            name: "locale",
            description: "The language you want to use",
            descriptionLocalizations: {
                "fr": "La langue que vous voulez utiliser",
                "en-US": "The language you want to use",
                "en-GB": "The language you want to use",
            },
            type: ApplicationCommandOptionType_STRING,
            required: true,
            choices: [{
                name: "English",
                value: "en",
                nameLocalizations: {
                    "fr": "Anglais",
                    "en-US": "English",
                    "en-GB": "English",
                }
            },
            {
                name: "Français",
                value: "fr",
                nameLocalizations: {
                    "fr": "Français",
                    "en-US": "French",
                    "en-GB": "French",
                }
            }
            ],
        },
    ],
};