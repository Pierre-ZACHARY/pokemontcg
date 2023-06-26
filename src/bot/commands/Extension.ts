import { CommandInteraction, Client } from "discord.js";
import { Command } from "../Command";

export const Extension: Command = {
    name: "extension",
    description: "Select the extension in which you are interested",
    type: 1, // Chat input
    run: async (client: Client, interaction: CommandInteraction) => {
        const content = "Hello there!";

        await interaction.followUp({
            ephemeral: true,
            content
        });
    }
};