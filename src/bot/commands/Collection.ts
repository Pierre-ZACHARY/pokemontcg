import { CommandInteraction, Client } from "discord.js";
import { Command } from "../Command";
import {ApplicationCommandOptionType_STRING} from "./Language";
import {prisma} from "../../prisma";
import {getLang} from "../utils/getLang";
export const ApplicationCommandOptionType_USER = 6;

async function displayCollection(discordId: string, client: Client, interaction: CommandInteraction){

    const userCollection = await prisma.collection.findMany({
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
        }
    });

    const prismaUser = await prisma.user.findUnique({
        where: {
            discordId: interaction.user.id
        }
    });
    console.assert(prismaUser !== null, "prismaUser !== null")
    const discordUser = await client.users.fetch(discordId); // TODO put this on redis
    let content = "";
    for(let i = 0; i < userCollection.length; i++){
        const card = userCollection[i].card;
        let cardI18n = card.cardI18n.find((cardI18n) => cardI18n.language === prismaUser!.language);
        if(cardI18n === undefined){
            cardI18n = card.cardI18n[0]; // probably english
        }
        content += cardI18n.name + " (" + card.cardI18n + ")\n";
    }
    // todo filter by 20 cards per page and add two buttons to navigate
    let embed = {
        title: "Collection",
        author: {
            name: discordUser.username.capitalize(),
            icon_url: discordUser.avatarURL() || undefined,
        },
        description: content,
        color: 0x00ff00,
    }
    await interaction.followUp({
        ephemeral: true,
        embeds: [embed]
    });

}
export const Collection: Command = {
    name: "collection",
    description: "Display your, or selected user's collection",
    type: 1, // Chat input
    run: async (client: Client, interaction: CommandInteraction) => {
        const data = interaction.options.data;
        if(data.length !== 1){
            await displayCollection(interaction.user.id,client, interaction);
            return;
        }
        console.assert(data[0].type === ApplicationCommandOptionType_USER, "data[0].type === USER");
        const user = data[0].value as string;
        await displayCollection(user, client, interaction);
    },
    options: [
        {
            name: "user",
            description: "@ the user whose collection you want to see",
            type: ApplicationCommandOptionType_USER,
        },
    ],
};