import {CommandInteraction, Client, EmbedBuilder, ButtonBuilder, ButtonStyle} from "discord.js";
import { Command } from "../Command";
import {ApplicationCommandOptionType_STRING} from "./Language";
import {prisma} from "../../prisma";
import {getLang} from "../utils/getLang";
import {discordUserRedis} from "../utils/redisWrapper";
import {ApplicationCommandOptionType_INTEGER} from "./Wishlist";
import {Language} from "../i18n/en";
export const ApplicationCommandOptionType_USER = 6;
const MAX_COLLECTION = 20;

async function displayCollection(discordId: string, client: Client, interaction: CommandInteraction, index: number = 0, userCollectionAll: any, prismaUser: any, discordUser: any, lang: Language, currentSort: string = "obtainedAt"){

    console.assert(prismaUser !== null, "prismaUser !== null")
    index = Math.min(Math.max(0, index), Math.ceil(userCollectionAll.length/MAX_COLLECTION) - 1);
    let sortedCollection = userCollectionAll;
    if(currentSort == "extension"){
        sortedCollection = userCollectionAll.sort((a: any, b: any) => {
            return a.card.extension.name < b.card.extension.name ? -1 : 1;
        });
    }
    else{
        sortedCollection = userCollectionAll.sort((a: any, b: any) => {
            return a.obtainedAt < b.obtainedAt ? -1 : 1;
        });
    }
    let userCollection = sortedCollection.slice(Math.min(index*MAX_COLLECTION,Math.max(0, sortedCollection.length-index*MAX_COLLECTION)), Math.min(sortedCollection.length,index*MAX_COLLECTION + MAX_COLLECTION));
    let content = "";
    for(let i = 0; i < userCollection.length; i++){
        const card = userCollection[i].card;
        let cardI18n = card.cardI18n.find((cardI18n : any) => cardI18n.language === prismaUser!.language);
        if(cardI18n === undefined){
            cardI18n = card.cardI18n[0]; // probably english
        }
        content += cardI18n.name + " (" + card.cardId + ")\n";
    }
    let embed = new EmbedBuilder()
        .setTitle("Collection")
        .setAuthor({name: discordUser.username.capitalize(), iconURL: discordUser.avatarUrl ?? undefined})
        .setDescription(content)
        .setColor(0x00ffff)
        .setFooter({text: "Page " + (index+1) + " of " + Math.ceil(userCollectionAll.length/MAX_COLLECTION)})
    const hasPrevious = index > 0;
    const hasNext = index < Math.ceil(userCollectionAll.length/MAX_COLLECTION) - 1;
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

    switch (currentSort) {
        case "obtainedAt":
            const sortByObtenedAt = new ButtonBuilder()
                .setCustomId("sortBy-obtainedAt")
                .setLabel(lang.sortByOptainedAt)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("📎")
            components.push(sortByObtenedAt);
            break;
        case "extension":
            const sortByExtension = new ButtonBuilder()
                .setCustomId("sortBy-extension")
                .setLabel(lang.sortByExtension)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("📎")
            components.push(sortByExtension);
            break;
    }


    const msg = await interaction.editReply({
        embeds: [embed],
        content: "",
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

            if(confirmation.customId == "next"){
                await displayCollection(discordId, client, interaction, index+1, userCollectionAll, prismaUser, discordUser, lang, currentSort);
            }
            else if(confirmation.customId == "previous"){
                await displayCollection(discordId, client, interaction, index-1, userCollectionAll, prismaUser, discordUser, lang, currentSort);
            }
            else if(confirmation.customId == "sortBy-extension"){
                await displayCollection(discordId, client, interaction, index-1, userCollectionAll, prismaUser, discordUser, lang, "obtainedAt");
            }
            else if(confirmation.customId == "sortBy-obtainedAt"){
                await displayCollection(discordId, client, interaction, index-1, userCollectionAll, prismaUser, discordUser, lang, "extension");
            }
        }
    }
    catch(e){
        await interaction.editReply({ components: [] });
    }


}
export const Collection: Command = {
    name: "collection",
    description: "Display a collection",
    descriptionLocalizations: {
        fr: "Affiche une collection"
    },
    type: 1, // Chat input
    run: async (client: Client, interaction: CommandInteraction) => {
        const data = interaction.options.data;
        const discordId = data.find((option: any) => option.type === ApplicationCommandOptionType_USER)?.value as string ?? interaction.user.id;
        const userCollectionP = prisma.collection.findMany({
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
                        extension: true
                    }
                }
            },
            orderBy: {
                obtainedAt: "desc"
            }
        });

        const prismaUserP = prisma.user.findUnique({
            where: {
                discordId: interaction.user.id
            }
        });
        const discordUserP =  discordUserRedis(discordId, client);
        const [userCollectionAll, prismaUser, discordUser] = await Promise.all([userCollectionP, prismaUserP, discordUserP]);
        const lang = getLang(prismaUser?.language ?? "en");
        await interaction.followUp({content: lang.loading, ephemeral: true});
        const index = data.find((option: any) => option.type === ApplicationCommandOptionType_INTEGER)?.value as number | undefined;
        await displayCollection(discordId, client, interaction, index ?? 0, userCollectionAll, prismaUser, discordUser, lang);
    },
    options: [
        {
            name: "user",
            description: "@ the user whose collection you want to see",
            descriptionLocalizations: {
                fr: "@ l'utilisateur dont vous voulez voir la collection"
            },
            type: ApplicationCommandOptionType_USER,
        },
        {
            name: "page",
            description: "The page of the collection",
            descriptionLocalizations: {
                fr: "La page de la collection"
            },
            type: 4,
        }
    ],
};