import {CommandInteraction, Client, EmbedBuilder, ButtonStyle, ButtonBuilder} from "discord.js";
import { Command } from "../Command";
import {ApplicationCommandOptionType_STRING} from "./Language";
import {prisma} from "../../prisma";
import {Language} from "../i18n/en";
import {getLang} from "../utils/getLang";

const MAX_EXTENSION_PER_PAGE = 20;

async function listExtension(index: number = 0, extensions: any, interaction: CommandInteraction, lang: Language){
    // find all extensions which have a least one card associated with them
    index = Math.min(Math.max(0, index), Math.ceil(extensions.length/MAX_EXTENSION_PER_PAGE) - 1);

    let result = lang.extensionUsage;
    for(let i = Math.min(index*MAX_EXTENSION_PER_PAGE, Math.max(extensions.length-MAX_EXTENSION_PER_PAGE, 0)); i < Math.min(extensions.length, index*MAX_EXTENSION_PER_PAGE+MAX_EXTENSION_PER_PAGE); i++){
        const numCards = extensions[i].cards.length;
        result += extensions[i].name + " \t- **" + extensions[i].acronym + "**\t*"+numCards+" cards*\n";
    }
    const embed = new EmbedBuilder()
        .setTitle("Extension")
        .setDescription(result)
        .setColor(0x00ffff)
        .setFooter({text: "Page " + (index+1) + " of " + Math.ceil(extensions.length/MAX_EXTENSION_PER_PAGE)})
    const hasPrevious = index > 0;
    const hasNext = index < Math.ceil(extensions.length/MAX_EXTENSION_PER_PAGE) - 1;
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
        content: "",
        components: components.length > 0 ? [{
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
                await listExtension(index+1, extensions, interaction, lang);
            }
            else if(confirmation.customId === "previous"){
                await listExtension(index-1, extensions, interaction, lang);
            }
        }
    }
    catch(e){
        await interaction.editReply({ components: [] });
    }
}


const MAX_CARDS_PER_PAGE = 20;
async function listCards(index: number = 0, extensions: any, cardList: any, interaction: CommandInteraction, userLang: string = "en", lang: Language){
    index = Math.min(Math.max(0, index), Math.ceil(extensions.cards.length/MAX_CARDS_PER_PAGE) - 1);

    const embed = new EmbedBuilder()
        .setTitle(extensions.name + " - " + extensions.acronym)

    let result = "";
    for(let i = Math.min(index*MAX_CARDS_PER_PAGE, Math.max(extensions.cards.length-MAX_CARDS_PER_PAGE, 0)); i < Math.min(extensions.cards.length, index*MAX_CARDS_PER_PAGE+MAX_CARDS_PER_PAGE); i++){
        let i18n = extensions.cards[i].cardI18n.find((i18n: any) => i18n.language === userLang) ?? extensions.cards[i].cardI18n[0];
        result += "**"+i18n.name + "** \t(" + extensions.cards[i].cardId + ")\n";
    }
    embed.setDescription(result)
        .setColor(0x00ffff)
        .setFooter({text: "Page " + (index+1) + " of " + Math.ceil(extensions.cards.length/MAX_CARDS_PER_PAGE)})
    const hasPrevious = index > 0;
    const hasNext = index < Math.ceil(extensions.cards.length/MAX_CARDS_PER_PAGE) - 1;
    let components = [];
    const selectExtension = new ButtonBuilder()
        .setCustomId("selectExtension")
        .setLabel("Select extension")
        .setStyle(ButtonStyle.Success)
        .setEmoji("✅")
    components.push(selectExtension);
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
        content: "",
        components: components.length > 0 ? [{
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
                await listCards(index+1, extensions,cardList, interaction, userLang, lang);
            }
            else if(confirmation.customId === "previous"){
                await listCards(index-1, extensions,cardList, interaction, userLang, lang);
            }
            else if(confirmation.customId === "selectExtension"){
                const prismaP = prisma.user.update({
                    where: {
                        discordId: interaction.user.id
                    },
                    data: {
                        selectedExtension: {
                            connect: {
                                id: extensions.id
                            }
                        }
                    },
                });
                const [prismaResult, msg] = await Promise.all([prismaP,
                    interaction.followUp({
                        ephemeral: true,
                        content: lang.extensionSelected,
                    })]);
                await listCards(index, extensions,cardList, interaction, userLang, lang);
            }
        }
    }
    catch(e){
        await interaction.editReply({ components: [] });
    }
}
export const Extension: Command = {
    name: "extension",
    description: "Select the extension in which you are interested",
    descriptionLocalizations: {
        fr: "Sélectionnez l'extension qui vous intéresse"
    },
    type: 1, // Chat input
    run: async (client: Client, interaction: CommandInteraction) => {
        const data = interaction.options.data;
        const prismaUser = await prisma.user.findUnique({
            where: {
                discordId: interaction.user.id
            }
        });
        const lang = getLang(prismaUser!.language);
        if(data.length !== 1){
            const extensionsP = prisma.extension.findMany({
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
            const [msg, extensions] = await Promise.all([interaction.followUp({
                ephemeral: true,
                content: lang.loading,
            }), extensionsP]);
            await listExtension(0, extensions, interaction, lang);
            return;
        }
        console.assert(data[0].type === ApplicationCommandOptionType_STRING, "data[0].type === STRING")
        const acronym = data[0].value as string;
        let extension = await prisma.extension.findUnique({
            where: {
                acronym: acronym,
            },
            include: {
                cards: {
                    include: {
                        cardI18n: true,
                    }
                }
            }
        });
        if(extension === null){
            const extensionsP = prisma.extension.findMany({
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
            const [msg, extensions] = await Promise.all([interaction.followUp({
                ephemeral: true,
                content: lang.loading,
            }), extensionsP]);
            await listExtension(0, extensions, interaction, lang);
            return;
        }
        const [msg] = await Promise.all([interaction.followUp({
            ephemeral: true,
            content: lang.loading
        })]);
        const cardList = extension.cards.sort((a: any, b: any) => ((a.cardId as string) < (b.cardId as string)) ? -1 : 1);
        await listCards(0, extension, cardList, interaction, prismaUser!.language, lang);
    },
    options: [
        {
            name: "acronym",
            description: "The extension acronym you want to select",
            descriptionLocalizations: {
                fr: "L'acronyme de l'extension que vous voulez sélectionner"
            },
            type: ApplicationCommandOptionType_STRING,
        },
    ],
};