import { CommandInteraction, Client } from "discord.js";
import { Command } from "../Command";

export const Wishlist: Command = {
    name: "wishlist",
    description: "Check the wishlist of a user",
    type: 1, // Chat input
    run: async (client: Client, interaction: CommandInteraction) => {
        const content = "Hello there!";

        await interaction.followUp({
            ephemeral: true,
            content
        });
    }
};