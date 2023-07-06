import {
    ActionRowBuilder,
    ButtonBuilder, ButtonInteraction,
    ButtonStyle, CacheType,
    Client, Collection, CollectorFilter,
    Colors,
    CommandInteraction,
    EmbedBuilder, Message
} from "discord.js";
import {Command} from "../Command";
import {prisma} from "../../prisma";
import {discordUserRedis, redisWrapper} from "../utils/redisWrapper";
import {getLang} from "../utils/getLang";
import {Language} from "../i18n/en";


export const CLAIM_MINUTES = 10;
export const ROLL_MINUTES = 30;
export const MAX_ROLLS = 30;
export const PUBLIC_CLAIM_SECONDS = 5;
async function listenButton(msg: Message<boolean>, interaction: CommandInteraction, client: Client, rolledcard: any,  prismaUser: any, i18n: any, lang: Language, rollstartTime: Date, defaultFooter: string = ""){

    const timeUntilAnyoneCanClaimInSeconds = Math.max(0, rollstartTime.getSeconds() + PUBLIC_CLAIM_SECONDS - new Date().getSeconds()-1);
    const waitTime = timeUntilAnyoneCanClaimInSeconds>0 ? timeUntilAnyoneCanClaimInSeconds*1000 : rollstartTime.getMilliseconds()+60*1000;
    if(waitTime<= 0){
        await interaction.editReply({ content: '', components: [] });
        return;
    }
    const anyoneCanClaim = timeUntilAnyoneCanClaimInSeconds <= 0;
    const collectorFilter = (i: any) =>
    {
        if(anyoneCanClaim){
            return i.user.id === interaction.user.id;
        }
        return true; // anyone can claim after 15 seconds
    };
    try {
        const button = new ButtonBuilder()
            .setCustomId("addCollection")
            .setLabel(lang.addToCollection + "\n (" + (anyoneCanClaim ? lang.anyoneCanClaim : interaction.user.username)+")")
            .setStyle(anyoneCanClaim ? ButtonStyle.Success : ButtonStyle.Primary)
            .setEmoji("📥");

        const msgEdited = await interaction.editReply({ components: [{
                type: 1,
                components: [button],
            },] });

        const confirmation = await msgEdited.awaitMessageComponent({ filter: collectorFilter, time: waitTime });

        const [usr, defer] = await Promise.all([prisma.user.findUnique({
            where: {
                discordId: confirmation.user.id,
            }
        }), confirmation.deferUpdate()]);
        if(!usr){
            await interaction.editReply({ content: '', components: [] });
            return;
        }
        if(usr.lastClaim && new Date(usr.lastClaim).getTime() > Date.now() - CLAIM_MINUTES * 60 * 1000){
            await interaction.followUp({ content: lang.nextClaim.fmt(Math.ceil((new Date(usr.lastClaim).getTime()-(Date.now() - CLAIM_MINUTES * 60 * 1000))/(1000*60))), components: [] });
            await listenButton(msg, interaction, client, rolledcard, prismaUser, i18n, lang, rollstartTime, defaultFooter);
            return;
        }
        if(confirmation.customId === "addCollection"){
            await Promise.all([prisma.collection.create({
                data: {
                    cardId: rolledcard.id,
                    serverId: interaction.guildId!,
                    userId: prismaUser.id,
                }
            }),
                interaction.followUp({
                    content: lang.successClaim.fmt(i18n!.name, rolledcard.cardId),
                    components: [],
                }),prisma.user.update({
                where: {
                    id: prismaUser.id,
                },
                data: {
                    lastClaim: new Date(),
                },
            }),
                prisma.wish.delete({
                    where: {
                        cardId_userId_serverId: {
                            cardId: rolledcard.id,
                            userId: prismaUser.id,
                            serverId: interaction.guildId!,
                        }
                    }
                })]);
            await interaction.editReply({ content: '', components: [] });
            return;
        }
        else{
            await listenButton(msg, interaction, client, rolledcard, prismaUser, i18n, lang, rollstartTime, defaultFooter); // listen again
        }
    } catch (e) {
        const timeUntilAnyoneCanClaimInSeconds = Math.max(0, rollstartTime.getSeconds() + PUBLIC_CLAIM_SECONDS - new Date().getSeconds());
        const waitTime = Math.max(rollstartTime.getMilliseconds()+60*1000, timeUntilAnyoneCanClaimInSeconds*1000);

        if(waitTime>0){
            // happens when no claim in 15 seconds
            await listenButton(msg, interaction, client, rolledcard, prismaUser, i18n, lang, rollstartTime, defaultFooter);
        }
        else{
            await interaction.editReply({ content: '', components: [] });
        }
    }
}
async function rollCard(extension: string){
    // all rarities of cards from this extension


    const redisTemp = await redisWrapper("rarities-"+extension, 3600, async ()=>{
        const cards = await prisma.card.findMany({
            where: {
                extension: {
                    acronym: extension
                }
            },
            include: {
                cardI18n: true,
                rarity: true,
            }
        });
        const rarities = new Map<number, {id: number, cards: typeof cards}>();
        for(let i = 0; i < cards.length; i++){
            const card = cards[i];
            if(!rarities.has(card.rarity.id)){
                rarities.set(card.rarity.id, {
                    id: card.rarity.id,
                    cards: [],
                });
            }
            rarities.get(card.rarity.id)!.cards.push(card);
        }
        let raritieslength = []; // number of cards per rarity
        for(let key of rarities.keys()){
            raritieslength.push(rarities.get(key)!.cards.length);
        }
        let total = 0;
        for(let i = 0; i < raritieslength.length; i++){
            total += raritieslength[i];
        }
        let pullChances = [];
        // pullChance is equal to square of rarities[i].cards.length / total
        for(let i = 0; i < raritieslength.length; i++){
            pullChances.push(Math.pow(raritieslength[i] / total, 1.3)); // the more y is high, the more hard it will be to get a card without many cards of that rarity
        }
        let pullChancesSum = 0;
        for(let i = 0; i < pullChances.length; i++){
            pullChancesSum += pullChances[i];
        }
        let pullChancesNormalizedMap = new Map<number, number>(); // rarityId -> pullChanceNormalized
        let iter = rarities.values();
        for(let i = 0; i < pullChances.length; i++){
            pullChancesNormalizedMap.set(iter.next().value.id, pullChances[i] / pullChancesSum);
        }
        return Array.from(pullChancesNormalizedMap.entries());
    });

    let pullChancesNormalizedMap = new Map<number, number>(redisTemp);

    let random = 1-Math.random();
    // get the rarity corresponding to the random number
    let i = 0;
    let rarityId;
    for(let key of pullChancesNormalizedMap.keys()){
        random -= pullChancesNormalizedMap.get(key)!;
        if(random < 0){
            rarityId = key;
            break;
        }
        i++;
    }
    // users rolled a card of rarity rarityId
    // get all cards of that rarity
    const cardsofRarity = await prisma.card.findMany({
        where: {
            rarity: {
                id: rarityId
            },
            extension: {
                acronym: extension
            }
        },
        include:{
            cardI18n: true,
            rarity: true,
        }
    });

    console.assert(cardsofRarity.length > 0, "cardsofRarity.length > 0")
     // pick a random card of that rarity
    return cardsofRarity[Math.floor(Math.random() * cardsofRarity.length)];
}
export const Roll: Command = {
    name: "roll",
    description: "Roll a card",
    descriptionLocalizations: {
        fr: "Tire une carte",
    },
    type: 1, // Chat input
    run: async (client: Client, interaction: CommandInteraction) => {
        const prismaUser = (await prisma.user.findUnique({
            where: {
                discordId: interaction.user.id,
            },
            include: {
                selectedExtension: true,
                rolls: true,
            }
        }))!;
        const lang = getLang(prismaUser.language);
        let last4hPromises = prismaUser.rolls.filter((roll) => {
            return new Date(roll.datetime).getTime() > Date.now() - ROLL_MINUTES * 60 * 1000;
        });
        if(last4hPromises.length >= MAX_ROLLS){
            let last4hPromisesOrdered = last4hPromises.sort((a, b) => {
                return new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
            });
            await interaction.followUp({
                content: lang.nextRoll.fmt(MAX_ROLLS, ROLL_MINUTES, Math.ceil((new Date(last4hPromisesOrdered[0].datetime).getTime() + ROLL_MINUTES * 60 * 1000 - Date.now()) / 1000 / 60)),
                ephemeral: true,
            });
            return;
        }
        let extension = prismaUser.selectedExtension;
        if(!extension){

            // select a random extension with at least one card not owned on this server
            const extensions = await prisma.extension.findMany({
                where: {
                    cards: {
                        some: {
                            collections: {
                                // no collection for current server id
                                none: {
                                    serverId: interaction.guildId!
                                }
                            }
                        }
                    }
                }
            });
            extension = extensions[Math.floor(Math.random() * extensions.length)];
        }
        const rolledcard = await rollCard(extension.acronym);

        let i18n = rolledcard.cardI18n.find((i18n) => i18n.language === prismaUser.language);
        if(i18n === undefined){
            i18n = rolledcard.cardI18n[0]; // english
        }

        const embed = new EmbedBuilder()
            .setTitle(i18n.name)
            .setURL("https://limitlesstcg.com/cards/en/"+rolledcard.cardId.replace("-", "/"))
            .setImage(i18n.imgUrl)
            .setDescription(rolledcard.rarity.name)
            .setColor(parseInt(rolledcard.rarity.color.slice(1), 16))
            .setFooter({ iconURL: "https://assets.pokemon.com/static2/_ui/img/favicon.ico", text: extension.name+ " - " + rolledcard.cardId})

        const msgP = interaction.followUp({
            embeds: [embed],
        });

        const collectionP = prisma.collection.findFirst({
            where: {
                serverId: interaction.guildId!,
                cardId: rolledcard.id,
            },
            include: {
                user: true,
            }
        })
        const wishesP = prisma.wish.findMany({
            where: {
                serverId: interaction.guildId!,
                cardId: rolledcard.id,
            },
            include: {
                user: true,
            }
        });
        let [collection, wishes, roll, msg] = await Promise.all([collectionP, wishesP, prisma.roll.create({
            data: {
                cardId: rolledcard.id,
                serverId: interaction.guildId!,
                userId: prismaUser.discordId,
            }
        }), msgP]);
        let ownerDiscordUser;
        if(collection !== null){
            ownerDiscordUser = await discordUserRedis(collection.user.discordId, client);
        }
        if(ownerDiscordUser) {
            embed.setAuthor({
                name: ownerDiscordUser.username,
                iconURL: ownerDiscordUser.avatarUrl,
            })
            await msg.edit({
                content: lang.ownedBy.fmt(ownerDiscordUser.username),
                embeds: [embed],
            });
        }
        else{
            listenButton(msg, interaction, client, rolledcard, prismaUser, i18n, lang, new Date(), extension.name+ " - " + rolledcard.cardId).then();
        }

        let content = "";
        const allUsers = await interaction.guild?.members.fetch({user: wishes.map((wish) => wish.user.discordId)});
        if(allUsers){
            for(let user of allUsers){
                content += lang.wishedBy.fmt(user.toString());
            }
        }

        if(content!=""){
            await msg.reply({content: content});
        }
    }
};