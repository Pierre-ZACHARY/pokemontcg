import { CommandInteraction, Client } from "discord.js";
import { Command } from "../Command";

export const Game: Command = {
    name: "game",
    description: "Select the game in which you are interested",
    type: 1, // Chat input
    run: async (client: Client, interaction: CommandInteraction) => {
        const content = "Hello there!";

        await interaction.followUp({
            ephemeral: true,
            content
        });
    }
};