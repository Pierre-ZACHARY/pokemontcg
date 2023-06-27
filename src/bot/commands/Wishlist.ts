import {CommandInteraction, Client, EmbedBuilder, ButtonBuilder, ButtonStyle} from "discord.js";
import { Command } from "../Command";
import {ApplicationCommandOptionType_USER} from "./Collection";
import {prisma} from "../../prisma";
import {discordUserRedis} from "../utils/redisWrapper";
import {getLang} from "../utils/getLang";
import {Language} from "../i18n/en";

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

const MAX_WISHLIST = 20;
export const ApplicationCommandOptionType_INTEGER = 4;
async function displayWishlist(target: string, client: Client, interaction: CommandInteraction, index: number =0, targetWishlist: any, prismaUser: any, discordUser: any, lang: Language ){
    index = Math.min(Math.max(0, index), Math.ceil(targetWishlist.length/MAX_WISHLIST) - 1);

    let embed = new EmbedBuilder()
        .setTitle("Wishlist")
        .setAuthor({name: discordUser.username.capitalize(), iconURL: discordUser.avatarUrl ?? undefined})
        .setColor(0x00ffff)

    let content = "";
    for(let i = Math.min(index*MAX_WISHLIST, Math.max(targetWishlist.length-MAX_WISHLIST, 0)); i < Math.min(targetWishlist.length, index*MAX_WISHLIST+MAX_WISHLIST); i++){
        const card = targetWishlist[i].card;
        const owned = card.collections.find((collection: any) => collection.user.discordId === target);
        if(owned){
            // remove from wishlist
            await prisma.wish.delete({
                where: {
                    cardId_userId_serverId: {
                        cardId: card.cardId,
                        userId: targetWishlist[i].userId,
                        serverId: interaction.guildId!
                    }
                }
            });
        }
        let cardI18n = card.cardI18n.find((cardI18n: any) => cardI18n.language === prismaUser!.language);
        if(cardI18n === undefined){
            cardI18n = card.cardI18n[0]; // probably english
        }
        content += cardI18n.name + " ("+card.cardId+")";
        const owner = card.collections.find((collection: any) => collection.serverId === interaction.guildId!);
        if(owner){
            const ownerUser = await client.users.fetch(owner.user.discordId);
            content += ownerUser.tag;
        }
        content += "\n";
    }
    embed.setDescription(content);
    const hasPrevious = index > 0;
    const hasNext = index < Math.ceil(targetWishlist.length/MAX_WISHLIST) - 1;
    let components = [];
    if(hasPrevious){
        const previous = new ButtonBuilder()
            .setCustomId("previous")
            .setLabel(lang.previous)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("⬅️")
        components.push(previous);
    }
    if(hasNext){
        const next = new ButtonBuilder()
            .setCustomId("next")
            .setLabel(lang.next)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("➡️")
        components.push(next);
    }
    const msg = await interaction.editReply({
        embeds: [embed],
        components: components.length>0?[{
            type: 1,
            components: components
        }] : []
    });

    try{
        if(components.length > 0){
            const collectorFilter = (i: any) => i.user.id === interaction.user.id;
            const confirmation = await msg.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
            await confirmation.deferUpdate();

            if(confirmation.customId === "next"){
                await displayWishlist(target, client, interaction, index+1, targetWishlist, prismaUser, discordUser, lang);
            }
            else if(confirmation.customId === "previous"){
                await displayWishlist(target, client, interaction, index-1, targetWishlist, prismaUser, discordUser,lang);
            }
        }
    }
    catch(e){
        await interaction.editReply({ components: [] });
    }
}

export const Wishlist: Command = {
    name: "wishlist",
    description: "Check the wishlist of a user",
    descriptionLocalizations: {
        fr: "Voir la wishlist d'un utilisateur"
    },
    type: 1, // Chat input
    run: async (client: Client, interaction: CommandInteraction) => {
        const data = interaction.options.data;
        const discordId = data.find((option: any) => option.type === ApplicationCommandOptionType_USER)?.name ?? interaction.user.id;
        const index = data.find((option: any) => option.type === ApplicationCommandOptionType_INTEGER)?.value as number | undefined;
        const targetWishlistP = prisma.wish.findMany({
            where: {
                user: {
                    discordId: discordId
                },
                serverId: interaction.guildId!
            },
            include: {
                card: {
                    include: {
                        cardI18n: true,
                        collections: {
                            include: {
                                user: true
                            }
                        }
                    }
                },
                user: true
            }
        });
        const prismaUserP = prisma.user.findUnique({
            where: {
                discordId: interaction.user.id
            }
        });
        const discordUserP = discordUserRedis(discordId, client);
        const [targetWishlist, prismaUser, discordUser] = await Promise.all([targetWishlistP, prismaUserP, discordUserP]);

        const lang = getLang(prismaUser!.language);
        await interaction.followUp({ content: lang.loading, ephemeral: true });
        await displayWishlist(discordId, client, interaction, index ?? 0, targetWishlist, prismaUser, discordUser, lang);
    },
    options: [
        {
            name: "user",
            description: "@ the user whose wishlist you want to see",
            descriptionLocalizations: {
                fr: "@ l'utilisateur dont vous voulez voir la wishlist"
            },
            type: 6,
        },
        {
            name: "page",
            description: "The page of the wishlist",
            descriptionLocalizations: {
                fr: "La page de la wishlist"
            },
            type: 4,
        }
    ],
};