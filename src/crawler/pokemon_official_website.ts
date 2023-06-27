import axios from "axios";
import {load} from "cheerio";
import {prisma} from "../prisma";
import {range} from "@discordjs/util";


declare global {
    interface String {
        fmt(...values: any[]): string;
    }
}

String.prototype.fmt = function (...values: any[]): string {
    return this.replace(/\{(\d+)\}/g, (match, index) => {
        const value = values[index] !== undefined ? values[index] : '';
        return String(value);
    });
};

let extension = ["swsh5", "sv02"];
let lang = ["fr", "en"];

/**
\brief Fetches a card from pokemon.com
\param extension The extension of the card
\param card The number of the card
\param customLink The custom link to fetch the card
*/
async function fetchCard(customLink: string = "{0}/{1}"): Promise<"success" | "error">{
    let url;
    // english
    let englishAxios = axios.get("https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/"+customLink);
    try{
        let englishResponse = await englishAxios;
        // ENGLISH
        let english = load(englishResponse.data);
        // card global
        const hpStr = english("div.card-description span.card-hp").last().text().replace("HP", "");
        let hp = parseInt(hpStr, 10);
        if(isNaN(hp)){
            hp = 0;
        }
        // rarity
        const rarity = english("div.stats-footer span").last().text().split(" ")[1];
        const rarityColor = "#000000"; // default color
        let prismaRarityPromise;
        try{
            prismaRarityPromise = prisma.rarity.upsert({
                where: {
                    name: rarity,
                },
                update: {

                },
                create: {
                    name: rarity,
                    color: rarityColor,
                }
            });
        }
        catch(e: any){
            console.log("error at {0} ({1})".fmt(customLink, e.message)); // this may happen if the rarity is created in parallel
            prismaRarityPromise = prisma.rarity.findFirst({
                where: {
                    name: rarity,
                }
            });
        }

        // extension name
        const extensionName = english("div.stats-footer h3").first().text();
        const prismaExtensionPromise = prisma.extension.findFirst({
            where: {
                name: extensionName,
            }
        });
        const result = await Promise.all([prismaRarityPromise, prismaExtensionPromise]);
        const prismaRarity = result[0];
        const prismaExtension = result[1];
        if(!prismaExtension){
            console.log("Extension {0} not found for {1}".fmt(extensionName, customLink));
            return "error";
        }


        const cardId = customLink.replace("/", "-").replace("/", "").toLowerCase();

        const prismaCard = await prisma.card.upsert({
            where: {
                cardId: cardId,
            },
            update: {
                hp: hp,
            },
            create: {
                cardId: cardId,
                hp: hp,
                rarityId: prismaRarity!.id,
                extensionId: prismaExtension.id,
            }
        });

        // english specific
        const name = english("div.card-description h1").first().text();
        const imgSrc = english("div.card-image>img").first().attr("src")!;

        const englishPromise = await prisma.cardI18n.upsert({
            where: {
                cardId_language: {
                    language: "en",
                    cardId: prismaCard.cardId,
                }
            },
            update: {
                name: name,
                imgUrl: imgSrc,
                language: "en",
            },
            create: {
                cardId: prismaCard.cardId,
                language: "en",
                name: name,
                imgUrl: imgSrc,
            }
        });
        // FRENCH
        try{
            let frenchAxios = axios.get("https://www.pokemon.com/fr/jcc-pokemon/cartes-pokemon/series/"+customLink);
            let frenchResponse = await frenchAxios;
            let french = load(frenchResponse.data);
            const nameFr = french("div.card-description h1").first().text();
            const imgSrcFr = french("div.card-image>img").first().attr("src")!;

            const frenchPromise = await prisma.cardI18n.upsert({
                where: {
                    cardId_language: {
                        language: "fr",
                        cardId: prismaCard.cardId,
                    }
                },
                update: {
                    name: nameFr,
                    imgUrl: imgSrcFr,
                    language: "fr",
                },
                create: {
                    cardId: prismaCard.cardId,
                    language: "fr",
                    name: nameFr,
                    imgUrl: imgSrcFr,
                }
            });
        }
        catch(AxiosError){
            console.log("[french] at {0} ({1})".fmt(customLink, AxiosError));
        }
        // console.log(imgSrc);
        // console.log(name);
        // console.log(nameFr);
        // console.log(imgSrcFr);
        // console.log(hp);
        // console.log(rarity);
        // console.log(extensionName);
        return "success";

    }
    catch (e: any){
        console.log("error at {0} {2} ({1})".fmt(customLink, e.message));
        return "error";
    }

    // check if Series exists
    // check if extension exists
    // check if card exists

}

async function createAllExtensionSeries(){
    let game_id = await prisma.game.findUnique({
        where: {
            name: "Pokemon TCG",
        }
    });
    if(!game_id){
        game_id = await prisma.game.create({
            data: {
                name: "Pokemon TCG",
            }
        });
    }
    let page1Axios = await axios.get("https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/?cardName=&cardText=&evolvesFrom=&simpleSubmit=&format=unlimited&hitPointsMin=0&hitPointsMax=340&retreatCostMin=0&retreatCostMax=5&totalAttackCostMin=0&totalAttackCostMax=5&particularArtist=");
    let page1 = load(page1Axios.data);
    let series = page1("div#filterExpansions h2.filter__heading");
    for(let i of range(series.length)){
        const serie = series[i];
        const serie_name = serie.firstChild?.type == "text" ? serie.firstChild.data : "no text";
        if(serie_name == "no text"){
            console.log("no text on serie {0}".fmt(i));
            continue;
        }
        let prismaSerie = await prisma.series.findUnique({
            where: {
                name: serie_name,
            }
        });

        const exp_list = page1("#filterExpansions fieldset:nth-child("+(i+1)+") li");
        for(let exp_acr of exp_list.find("label")){
            const acr = exp_acr.attribs["for"];
            const series_acr = acr.replace(RegExp(/\d+.*/g), "");
            const name = exp_list.find("label[for="+exp_acr.attribs["for"]+"] span").text();
            if(!prismaSerie){
                console.log("creating serie {0} with acr={1}".fmt(serie_name, series_acr));
                prismaSerie = await prisma.series.create({
                    data: {
                        name: serie_name,
                        gameId: game_id.id,
                        // swsh5tg
                        acronym: series_acr,
                    }
                });
            }
            let extension = await prisma.extension.upsert({
                where: {
                    acronym: acr,
                },
                update: {
                    name: name,
                    acronym: acr,
                    seriesId: prismaSerie.id,
                },
                create: {
                    name: name,
                    acronym: acr,
                    seriesId: prismaSerie.id,
                },
            });
        }
    }
}

async function fetchAllCards(pageIndex: number = 1){
    console.log("fetching page {0}".fmt(pageIndex));
    let pageAxios = await axios.get("https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/"+pageIndex+"?cardName=&cardText=&evolvesFrom=&simpleSubmit=&format=unlimited&hitPointsMin=0&hitPointsMax=340&retreatCostMin=0&retreatCostMax=5&totalAttackCostMin=0&totalAttackCostMax=5&particularArtist=");
    let page = load(pageAxios.data);
    let numPagesStr = page("div#cards-load-more>div>span").first().text();
    let numberOfPages = parseInt(numPagesStr.split(" ")[2], 10);
    const card_list_size = page("ul.cards-grid li").length;
    let promises: Promise<any>[] = [];
    for(let index of range(card_list_size)){
        //console.log(index);
        const link = page("ul.cards-grid li:nth-child("+(index+1)+") a");
        const href = link.attr("href")!;
        //console.log(href);
        const card_link = href.replace("/us/pokemon-tcg/pokemon-cards/series/", "");
        //console.log(card_link);
        promises.push(fetchCard(card_link));
    }
    await Promise.all(promises);
    if(pageIndex < numberOfPages){
        await fetchAllCards(pageIndex+1);
    }
    return;
}

fetchAllCards(0);

