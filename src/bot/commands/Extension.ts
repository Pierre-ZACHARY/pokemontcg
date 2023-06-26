import { CommandInteraction, Client } from "discord.js";
import { Command } from "../Command";
import {ApplicationCommandOptionType_STRING} from "./Language";
import {prisma} from "../../prisma";


async function listExtension() : Promise<string>{
    // find all extensions which have a least one card associated with them
    const extensions = await prisma.extension.findMany({
        where: {
            cards: {
                some: {}
            }
        },
        select: {
            name: true,
            acronym: true,
            cards: {
                select: {
                    id: true,
                }
            }
        }
    });
    let result = "Invalid Extension, please select a valid extension acronym:\n**Name - Acronym**\n\n";
    for(let i = 0; i < extensions.length; i++){
        const numCards = extensions[i].cards.length;
        result += extensions[i].name + " --> **" + extensions[i].acronym + "**\t*"+numCards+" cards*\n";
    }
    return result; // TODO put this on redis
}
export const Extension: Command = {
    name: "extension",
    description: "Select the extension in which you are interested",
    type: 1, // Chat input
    run: async (client: Client, interaction: CommandInteraction) => {
        // TODO translate this
        const data = interaction.options.data;
        if(data.length !== 1){
            await interaction.followUp({
                ephemeral: true,
                content: await listExtension() // TODO when we add /game, we can filter extensions by game
            });
            return;
        }
        console.assert(data[0].type === ApplicationCommandOptionType_STRING, "data[0].type === STRING")
        const acronym = data[0].value as string;
        let extension = await prisma.extension.findUnique({
            where: {
                acronym: acronym,
            }
        });
        if(extension === null){
            await interaction.followUp({
                ephemeral: true,
                content: await listExtension()
            });
            return;
        }
        await prisma.user.update({
            where: {
                discordId: interaction.user.id,
            },
            data: {
                selectedExtension: {
                    connect: {
                        id: extension.id,
                    }
                }
            }
        });

        const content = "Successfully selected extension: " + extension.name + " - " + extension.acronym + "\n";

        await interaction.followUp({
            ephemeral: true,
            content
        });
    },
    options: [
        {
            name: "acronym",
            description: "The extension acronym you want to select",
            type: ApplicationCommandOptionType_STRING,
        },
    ],
};