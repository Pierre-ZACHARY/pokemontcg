import {CommandInteraction, Client, EmbedBuilder} from "discord.js";
import { Command } from "../Command";
import {prisma} from "../../prisma";
import {getLang} from "../utils/getLang";

export const Inventory: Command = {
    name: "inventory",
    description: "Displays your inventory",
    type: 1, // Chat input
    run: async (client: Client, interaction: CommandInteraction) => {
        const content = "";

        const user = await prisma.user.findFirst({
            where: {
                discordId: interaction.user.id
            },
            include: {
                boosters: {
                    include: {
                        Booster: {
                            include: {
                                extension: true
                            }
                        }
                    }
                },
                purchasedGoods: true
            }
        });
        const lang = getLang(user!.language);
        let boostersString: string = "";
        const boosters = user!.boosters;
        let boosterIdExtensionMap = new Map<number, [number, string, string]>();
        for(let ownedBooster of boosters){
            const booster = ownedBooster.Booster;
            if(boosterIdExtensionMap.has(booster.id)){
                let newvalue = boosterIdExtensionMap.get(booster.id)!;
                newvalue[0] ++;
                boosterIdExtensionMap.set(booster.id, newvalue!)
            }
            else{
                boosterIdExtensionMap.set(booster.id, [1, booster.extension.acronym, booster.extension.name]);
            }
        }
        for(const [boosterId, [number, acronym, name]] of boosterIdExtensionMap){
            boostersString += "[{0}] {1}{2}\n".fmt(acronym, name, number>1?" x{0}".fmt(number):"");
        }

        const numCards = await prisma.collection.count({
            where:{
                user:{
                    discordId: interaction.user.id,
                },
                server: {
                    discordId: interaction.guildId!
                }
            }
        });

        const purchasedGoods = user!.purchasedGoods;
        let purchasedGoodsIdExtensionMap = new Map<number, [number, string]>();
        for(let goods of purchasedGoods){
            if(purchasedGoodsIdExtensionMap.has(goods.id)){
                let [count, name] = purchasedGoodsIdExtensionMap.get(goods.id)!;
                purchasedGoodsIdExtensionMap.set(goods.id, [count+1, name]);
            }
            else{
                purchasedGoodsIdExtensionMap.set(goods.id, [1, goods.name]);
            }
        }
        let purchasedGoodsString = "";
        for(const [goodsId, [number, name]] of purchasedGoodsIdExtensionMap){
            boostersString += "{0}{1}\n".fmt(name, number>1?" x{0}".fmt(number):"");
        }

        const embed = new EmbedBuilder()
            .setAuthor({
                name: interaction.user.username,
            })
            .setTitle("Inventory")
            //.setURL("https://example.com") // TODO add collection link
            //.setDescription("This is an example description. Markdown works too!\n\nhttps://automatic.links\n> Block Quotes\n```\nCode Blocks\n```\n*Emphasis* or _emphasis_\n`Inline code` or ``inline code``\n[Links](https://example.com)\n<@123>, <@!123>, <#123>, <@&123>, @here, @everyone mentions\n||Spoilers||\n~~Strikethrough~~\n**Strong**\n__Underline__")
            .addFields(
                {
                    name: "💰Coins",
                    value: user!.coins.toString(),
                    inline: true,
                },
                {
                    name: "Daily Coins",
                    value: user!.dailyCoinsReceived.toString()+" / "+user!.dailyCoins.toString(),
                    inline: true,
                },
            )
            .addFields(
                {
                    name: "🎴Cards",
                    value: numCards.toString(),
                    inline: true,
                },
                {
                    name: "Boosters",
                    value: boostersString,
                    inline: true,
                },
                {
                    name: "Objects",
                    value: purchasedGoodsString,
                    inline: true,
                }
            )
            //.setImage("https://cubedhuang.com/images/alex-knight-unsplash.webp")
            //.setThumbnail("https://dan.onl/images/emptysong.jpg")
            .setColor("#35f400")
            //.setFooter({
            //    text: "Example Footer",
            //    iconURL: "https://slate.dan.onl/slate.png",
            //})
            .setTimestamp();

        await interaction.followUp({
            ephemeral: false,
            content,
            embeds: [embed]
        });
    }
};