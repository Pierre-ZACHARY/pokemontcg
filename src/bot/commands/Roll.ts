import { CommandInteraction, Client } from "discord.js";
import { Command } from "../Command";

export const Hello: Command = {
    name: "roll",
    description: "Roll a card",
    type: 1, // Chat input
    run: async (client: Client, interaction: CommandInteraction) => {
        const content = "Hello there!";

        await interaction.followUp({
            ephemeral: true,
            content
        });
    }
};