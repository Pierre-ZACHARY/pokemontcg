import {CommandInteraction, Client, EmbedBuilder} from "discord.js";
import { Command } from "../Command";
import {ApplicationCommandOptionType_USER} from "./Collection";
import {prisma} from "../../prisma";

declare global {
    interface String {
        fmt(...values: any[]): string;
        capitalize(): string;
    }
}

String.prototype.fmt = function (...values: any[]): string {
    return this.replace(/\{(\d+)\}/g, (match, index) => {
        const value = values[index] !== undefined ? values[index] : '';
        return String(value);
    });
};

String.prototype.capitalize = function (): string {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
async function displayWishlist(target: string, client: Client, interaction: CommandInteraction ){
    const targetWishlist = await prisma.wish.findMany({
        where: {
            user: {
                discordId: target
            },
            serverId: interaction.guildId!
        },
        include: {
            card: {
                include: {
                    cardI18n: true
                }
            }
        }
    });
    const prismaUser = await prisma.user.findUnique({
        where: {
            discordId: interaction.user.id
        }
    });
    console.assert(prismaUser !== null, "prismaUser !== null")
    const discordUser = await client.users.fetch(target); // TODO put this on redis

    let embed = new EmbedBuilder()
        .setTitle("Wishlist")
        .setAuthor({name: discordUser.username.capitalize(), iconURL: discordUser.avatarURL()! || undefined})
        .setColor(0x00ffff)

    let content = "";
    for(let i = 0; i < Math.min(targetWishlist.length, 10); i++){ // add pagination
        const card = targetWishlist[i].card;
        let cardI18n = card.cardI18n.find((cardI18n) => cardI18n.language === prismaUser!.language);
        if(cardI18n === undefined){
            cardI18n = card.cardI18n[0]; // probably english
        }
        content += cardI18n.name + " ("+card.cardId+")\n"; // TODO the card may be owned by another user, display it
    }
    embed.setDescription(content);

    await interaction.followUp({
        ephemeral: true,
        embeds: [embed]
    });
}

export const Wishlist: Command = {
    name: "wishlist",
    description: "Check the wishlist of a user",
    type: 1, // Chat input
    run: async (client: Client, interaction: CommandInteraction) => {
        const data = interaction.options.data;
        if(data.length !== 1){
            await displayWishlist(interaction.user.id,client, interaction);
            return;
        }
        console.assert(data[0].type === ApplicationCommandOptionType_USER, "data[0].type === USER");
        const user = data[0].value as string;
        await displayWishlist(user, client, interaction);
    },
    options: [
        {
            name: "user",
            description: "@ the user whose wishlist you want to see",
            type: ApplicationCommandOptionType_USER,
        },
    ],
};