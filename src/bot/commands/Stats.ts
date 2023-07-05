import {CommandInteraction, Client, EmbedBuilder} from "discord.js";
import { Command } from "../Command";
import {ApplicationCommandOptionType_USER} from "./Collection";
import {prisma} from "../../prisma";

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
            }
        });
        const result = await Promise.all([user, prismaUser]);
        const map = result[1]!.rolls.map((roll) => {
            return roll.card.rarity.name;
        });
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
            .setAuthor({name: result[0]!.username, iconURL: result[0]!.avatarURL()!})
            .setTitle("Stats")
            .setColor(0x00ffff)
            .setDescription(content)

        await interaction.followUp({
            ephemeral: true,
            embeds: [embed]
        });
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