import {CommandInteraction, Client, EmbedBuilder} from "discord.js";
import { Command } from "../Command";
import {ApplicationCommandOptionType_STRING} from "./Language";
import {prisma} from "../../prisma";

export const Card: Command = {
    name: "card",
    description: "Display a card by its id",
    type: 1, // Chat input
    run: async (client: Client, interaction: CommandInteraction) => {
        const content = "Hello there!";
        const data = interaction.options.data;
        if(data.length !== 1){
            await interaction.followUp({
                ephemeral: true,
                content: "Invalid cardId"
            });
            return;
        }
        console.assert(data[0].type === ApplicationCommandOptionType_STRING, "data[0].type === STRING")
        const cardid = data[0].value as string;
        const card = await prisma.card.findUnique({
            where: {
                cardId: cardid,
            },
            include: {
                cardI18n: true,
                rarity: true,
                extension: true,
                collections: {
                    include: {
                        user: true,
                    }
                },
            }
        });
        if(!card){
            await interaction.followUp({
                ephemeral: true,
                content: "Card not found"
            });
            return;
        }
        const prismaUser = await prisma.user.findUnique({
            where: {
                discordId: interaction.user.id,
            }
        });
        let i18n = card.cardI18n.find((i18n) => i18n.language === prismaUser!.language);
        if(i18n === undefined){
            i18n = card.cardI18n[0]; // english
        }
        let col = card.collections.find((collection) => collection.serverId === interaction.guild!.id);

        const embed = new EmbedBuilder()
            .setTitle(i18n.name)
            .setURL("https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/"+card.cardId.replace("-", "/"))
            .setImage(i18n.imgUrl)
            .setDescription(card.rarity.name)
            .setColor(parseInt(card.rarity.color.slice(1), 16))
            .setFooter({ iconURL: "https://assets.pokemon.com/static2/_ui/img/favicon.ico", text: card.extension.name+ " - " + card.cardId})

        const msg = await interaction.followUp({
            embeds: [embed],
        });
        if(col){
            const discordUser = await client.users.fetch(col.user.discordId);
            embed.setAuthor({
                name: discordUser.username,
                iconURL: discordUser.avatarURL()!,
            })
            await msg.edit({
                embeds: [embed],
            });
        }
    },
    options: [
        {
            name: "cardid",
            description: "CardId correspond to extension acronym - card number (e.g. sv02-001)",
            type: ApplicationCommandOptionType_STRING,
        },
    ],
};