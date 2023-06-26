import {Client, Colors, CommandInteraction, EmbedBuilder} from "discord.js";
import {Command} from "../Command";
import {prisma} from "../../prisma";

async function rollCard(extension: string){
    // all rarities of cards from this extension
    // TODO : may we filter card not already owned ?
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
    let pullChancesNormalizedMap = new Map<number, number>(); // rarityId -> pullChanceNormalized TODO : put this on redis with key = RollCard[extension]
    let pullChancesNormalized = [];
    let iter = rarities.values();
    for(let i = 0; i < pullChances.length; i++){
        pullChancesNormalized.push(pullChances[i] / pullChancesSum);
        pullChancesNormalizedMap.set(iter.next().value.id, pullChancesNormalized[i]);
    }
    let random = 1-Math.random();
    // get the rarity corresponding to the random number
    let cardsofRarity = rarities.get(rarities.keys().next().value)!.cards;
    let i = 0;
    for(let key of rarities.keys()){
        random -= pullChancesNormalized[i];
        if(random < 0){
            cardsofRarity = rarities.get(key)!.cards;
            break;
        }
        i++;
    }
    // users rolled a card of rarity rarities[rarity]

    console.assert(cardsofRarity.length > 0, "cardsofRarity.length > 0")
     // pick a random card of that rarity
    return cardsofRarity[Math.floor(Math.random() * cardsofRarity.length)];
}
export const Roll: Command = {
    name: "roll",
    description: "Roll a card",
    type: 1, // Chat input
    run: async (client: Client, interaction: CommandInteraction) => {
        const prismaUser = (await prisma.user.findUnique({
            where: {
                discordId: interaction.user.id,
            },
            include: {
                selectedExtension: true,
            }
        }))!;
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


        const collection = await prisma.collection.findFirst({
            where: {
                serverId: interaction.guildId!,
                cardId: rolledcard.id,
            },
            include: {
                user: true,
            }
        });
        let ownerDiscordUser;
        if(collection !== null){
            ownerDiscordUser = await client.users.fetch(collection.user.discordId);
        }

        const wishes = await prisma.wish.findMany({
            where: {
                serverId: interaction.guildId!,
                cardId: rolledcard.id,
            },
            include: {
                user: true,
            }
        });

        let content = "";
        for(let i = 0; i < wishes.length; i++){
            content += `wished by <@${wishes[i].user.discordId}> \n`;
        }


        const embed = new EmbedBuilder()
            .setTitle(i18n.name)
            .setURL("https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/"+rolledcard.cardId.replace("-", "/"))
            .setImage(i18n.imgUrl)
            .setDescription(rolledcard.rarity.name)
            .setColor(parseInt(rolledcard.rarity.color.slice(1), 16))
            .setFooter({ iconURL: "https://assets.pokemon.com/static2/_ui/img/favicon.ico", text: extension.name+ " - " + rolledcard.cardId})
        if(ownerDiscordUser !== undefined) {
            embed.setAuthor({
                name: ownerDiscordUser!.username,
                iconURL: ownerDiscordUser!.avatarURL()!,
            })
        }

        await interaction.followUp({
            ephemeral: true,
            content,
            embeds: [embed]
        });
    }
};