import {CommandInteraction, Client, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder} from "discord.js";
import { Command } from "../Command";
import {prisma} from "../../prisma";
import {getLang} from "../utils/getLang";

export const Shop: Command = {
    name: "shop",
    description: "Open the shop to purchase boosters or objects",
    type: 1, // Chat input
    run: async (client: Client, interaction: CommandInteraction) => {
        console.assert(interaction.guild, "Must be used in a guild");
        const user = await prisma.user.findFirst({
            where: {
                discordId: interaction.user.id
            }
        })!;
        const shop = await prisma.shop.findFirst({
            where: {
                server: {
                    discordId: interaction.guildId!
                }
            },
            include: {
                server: true,
                goods: true,
                boosters: {
                    include: {
                        extension: true,
                    },
                },
            }
        });

        console.assert(shop!.goods);

        let firstGood = shop!.goods![0];
        const embed = new EmbedBuilder()
            .setAuthor({
                name: interaction.user.username,
            })
            .setTitle("Shop")
            .addFields(
                {
                    name: "💰Coins",
                    value: user!.coins.toString(),
                })
            .setImage(firstGood.imgUrl);

        const FirstBooster = new EmbedBuilder()
            .setImage(shop!.boosters![0].imgUrl);
        const SecondBooster = new EmbedBuilder()
            .setImage(shop!.boosters![1].imgUrl);
        const ThirdBooster = new EmbedBuilder()
            .setImage(shop!.boosters![2].imgUrl);
        const FirstBoosterButton = new ButtonBuilder()
            .setCustomId(shop!.boosters![0].extension.id.toString())
            .setLabel("{0} - {1}".fmt(shop!.boosters![0].extension.acronym, shop!.boosters![0].price))
            .setStyle(ButtonStyle.Secondary)
            .setEmoji({ name: '💰💸' });
        const SecondBoosterButton = new ButtonBuilder()
            .setCustomId(shop!.boosters![1].extension.id.toString())
            .setLabel("{0} - {1}".fmt(shop!.boosters![1].extension.acronym, shop!.boosters![1].price))
            .setStyle(ButtonStyle.Secondary)
            .setEmoji({ name: '💰' });
        const ThirdBoosterButton = new ButtonBuilder()
            .setCustomId( shop!.boosters![2].extension.id.toString())
            .setLabel("{0} - {1}".fmt(shop!.boosters![2].extension.acronym, shop!.boosters![2].price))
            .setStyle(ButtonStyle.Secondary)
            .setEmoji({ name: '💰' });
        const FirstGoodsButton = new ButtonBuilder()
            .setCustomId(firstGood.name.toString())
            .setLabel("{0} - {1}".fmt(firstGood.name, firstGood.price))
            .setStyle(ButtonStyle.Secondary)
            .setEmoji({ name: '💰' });
        let row = new ActionRowBuilder(
            {
                components: [FirstBoosterButton, SecondBoosterButton, ThirdBoosterButton, FirstGoodsButton]
            }
        );
        console.log(row);
        await interaction.followUp({
            //ephemeral: false,
            content: "",
            embeds: [embed, FirstBooster, SecondBooster, ThirdBooster],
            components: [
                // @ts-ignore TODO: Fix this
                row
            ],

        });
    }
};