import {CommandInteraction, Client, ApplicationCommandOptionBase, ApplicationCommandOptionData} from "discord.js";
import { Command } from "../Command";

export const Language: Command = {
    name: "language",
    description: "Change the language of the bot",
    type: 1, // Chat input
    run: async (client: Client, interaction: CommandInteraction) => {
        const content = "Hello there!";
        const lang = interaction.options.data;

        console.log(lang);
        await interaction.followUp({
            ephemeral: true,
            content
        });
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
            type: 3,
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