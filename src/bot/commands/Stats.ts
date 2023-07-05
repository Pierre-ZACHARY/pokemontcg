import {CommandInteraction, Client, EmbedBuilder, ButtonBuilder, ButtonStyle} from "discord.js";
import { Command } from "../Command";
import {ApplicationCommandOptionType_USER} from "./Collection";
import {prisma} from "../../prisma";
import {getLang} from "../utils/getLang";

const buildStats = async (interaction: any, discordUser: any, prismaUser: any, statsType: "roll" | "collection") => {
    const map = statsType == "roll" ? prismaUser!.rolls.map((roll: any) => {
        return roll.card.rarity.name;
    }) : prismaUser!.collections.map((col: any) => {
        return col.card.rarity.name;
    }) ;
    // Create an empty map
    const occurrenceMap = new Map();

    // Iterate through the array
    for (const key of map) {
        // If the key exists in the map, increment its count
        if (occurrenceMap.has(key)) {
            occurrenceMap.set(key, occurrenceMap.get(key) + 1);
        } else {
            // If the key doesn't exist, initialize its count to 1
            occurrenceMap.set(key, 1);
        }
    }
    let content = "";
    for(const [key, value] of occurrenceMap){
        content += `${key}: ${value}\n`;
    }


    const embed = new EmbedBuilder()
        .setAuthor({name: discordUser.username, iconURL: discordUser.avatarURL()!})
        .setTitle(statsType.capitalize()+" stats")
        .setColor(0x00ffff)
        .setDescription(content)

    const button = new ButtonBuilder()
        .setCustomId(statsType)
        .setLabel(statsType == "roll" ? "Rolls" : "Collection")
        .setStyle(ButtonStyle.Primary)

    const msg = await interaction.editReply({
        ephemeral: true,
        content: "",
        embeds: [embed],
        components: [
            {
                type: 1,
                components: [button]
            }
        ]
    });

    try{
        const confirm=await msg.awaitMessageComponent({
            filter: (i: any) => i.user.id === interaction.user.id,
            time: 60000
        });
        await confirm.deferUpdate();
        await buildStats(interaction, discordUser, prismaUser, statsType == "roll" ? "collection" : "roll")

    }
    catch(err){
        await msg.edit({
            components: []
        });
    }
}
export const Stats: Command = {
    name: "stats",
    description: "Returns roll stats of a user",
    descriptionLocalizations: {
        fr: "Retourne les stats de roll d'un utilisateur"
    },
    type: 1, // Chat input
    run: async (client: Client, interaction: CommandInteraction) => {
        const data = interaction.options.data;
        let userid = interaction.user.id;
        if(data.length === 1){
            userid = data[0].value as string;
        }
        const user = client.users.fetch(userid);
        const prismaUser = prisma.user.findUnique({
            where: {
                discordId: userid,
            },
            include: {
                rolls: {
                    include: {
                        card: {
                            include: {
                                rarity: true
                            }
                        },
                    }
                },
                collections:{
                    include: {
                        card: {
                            include: {
                                rarity: true
                            }
                        }
                    }
                }
            }
        });
        const result = await Promise.all([user, prismaUser]);
        await interaction.followUp({
            ephemeral: true,
            content: getLang(result[1]?.language ?? "en").loading
        })

        await buildStats(interaction, result[0], result[1], "roll");
    },
    options: [
        {
            name: "user",
            description: "@ the user stats you want to see",
            descriptionLocalizations: {
                fr: "@ l'utilisateur dont vous voulez voir les stats"
            },
            type: ApplicationCommandOptionType_USER,
        },
    ],
};