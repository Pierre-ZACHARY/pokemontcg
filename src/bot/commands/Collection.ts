import {CommandInteraction, Client, EmbedBuilder, ButtonBuilder, ButtonStyle} from "discord.js";
import { Command } from "../Command";
import {ApplicationCommandOptionType_STRING} from "./Language";
import {prisma} from "../../prisma";
import {getLang} from "../utils/getLang";
import {discordUserRedis} from "../utils/redisWrapper";
import {ApplicationCommandOptionType_INTEGER} from "./Wishlist";
export const ApplicationCommandOptionType_USER = 6;
const MAX_COLLECTION = 20;

async function displayCollection(discordId: string, client: Client, interaction: CommandInteraction, index: number = 0, userCollectionAll: any, prismaUser: any, discordUser: any){

    console.assert(prismaUser !== null, "prismaUser !== null")
    index = Math.min(Math.max(0, index), Math.ceil(userCollectionAll.length/MAX_COLLECTION) - 1);
    let userCollection = userCollectionAll.slice(Math.min(index*MAX_COLLECTION,Math.max(0, userCollectionAll.length-index*MAX_COLLECTION)), Math.min(userCollectionAll.length,index*MAX_COLLECTION + MAX_COLLECTION));
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
            .setLabel("Previous")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("⬅️")
        components.push(previous);
    }
    if(hasNext){
        const next = new ButtonBuilder()
            .setCustomId("next")
            .setLabel("Next")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("➡️")
        components.push(next);
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

            if(confirmation.customId === "next"){
                await displayCollection(discordId, client, interaction, index+1, userCollectionAll, prismaUser, discordUser);
            }
            else if(confirmation.customId === "previous"){
                await displayCollection(discordId, client, interaction, index-1, userCollectionAll, prismaUser, discordUser);
            }
        }
    }
    catch(e){
        await interaction.editReply({ components: [] });
    }


}
export const Collection: Command = {
    name: "collection",
    description: "Display your, or selected user's collection",
    type: 1, // Chat input
    run: async (client: Client, interaction: CommandInteraction) => {
        const data = interaction.options.data;
        const discordId = data.find((option: any) => option.type === ApplicationCommandOptionType_USER)?.name ?? interaction.user.id;
        const userCollectionP = prisma.collection.findMany({
            where: {
                user: {
                    discordId: discordId
                }
            },
            include: {
                card: {
                    include: {
                        cardI18n: true
                    }
                }
            },
        });

        const prismaUserP = prisma.user.findUnique({
            where: {
                discordId: interaction.user.id
            }
        });
        const discordUserP =  discordUserRedis(discordId, client);
        const [userCollectionAll, prismaUser, discordUser] = await Promise.all([userCollectionP, prismaUserP, discordUserP]);
        await interaction.followUp({content: "Loading collection...", ephemeral: true});
        const index = data.find((option: any) => option.type === ApplicationCommandOptionType_INTEGER)?.value as number | undefined;
        await displayCollection(discordId, client, interaction, index ?? 0, userCollectionAll, prismaUser, discordUser);
    },
    options: [
        {
            name: "user",
            description: "@ the user whose collection you want to see",
            type: ApplicationCommandOptionType_USER,
        },
        {
            name: "page",
            description: "The page of the collection",
            type: 4,
        }
    ],
};