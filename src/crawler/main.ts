import axios from "axios";
import {load} from "cheerio";
import {children} from "cheerio/lib/api/traversing";
import {prisma} from "../prisma";

async function fetchCard(cardLink: string, prismaExtension: any){
    const axiosRequest = axios.get(cardLink);
    const axiosRequestFR = axios.get(cardLink.replace("/en/", "/fr/"    ));
    const [axiosResponse, axiosResponseFR] = await Promise.all([axiosRequest, axiosRequestFR]);
    const page = load(axiosResponse.data);
    const pageFR = load(axiosResponseFR.data);
    const cardName = page("span.card-text-name a").text();
    let cardNameFR = pageFR("span.card-text-name a").text();
    if(cardNameFR === ""){
        cardNameFR = cardName;
    }
    const imgSrc = page("div.card-image>img").first().attr("src")!;
    const imgSrcFR = pageFR("div.card-image>img").first().attr("src")!;
    const splitCardLink = cardLink.split("/");
    const cardNumber = splitCardLink.pop()!;
    const extensionAcronym = splitCardLink.pop()!;
    const cardId = extensionAcronym+"-"+cardNumber;
    let hp = "0";
    try{
        hp = page("p.card-text-title").text().split("-")[2].replace(" HP", "").replace("\n", "").replaceAll(" ", "");
    }
    catch (e: any){
        console.log("Failed to parse hp on : "+cardLink+" (" +e.message+")");
    }
    let rarity;
    try{
        rarity = page("div.prints-current-details span").text().split("·")[1].replace("\n", "").replaceAll(" ", "");
    }
    catch (e: any){
        const doesTheExtensionContainsPromo = prismaExtension.name.includes("Promo");
        if(!doesTheExtensionContainsPromo){
            console.error("Not a promo!")
        }
        console.log("Failed to parse rarity on : "+cardLink+" (" +e.message+")"+(doesTheExtensionContainsPromo ? " (Promo)" : "Not a promo!"));
        rarity = "Promo";
    }
    let prismaRarity;
    try{
        prismaRarity = await prisma.rarity.upsert({
            where: {
                name: rarity,
            },
            update: {

            },
            create: {
                name: rarity,
                color: "#000000",
            }
        });
    }
    catch (e){
        prismaRarity = await prisma.rarity.findFirst({
            where: {
                name: rarity,
            }
        });
    }

    let hpInt = parseInt(hp, 10);
    if(isNaN(hpInt)){
        hpInt = 0;
    }
    const prismaCard = await prisma.card.upsert({
        where: {
            cardId: cardId,
        },
        update: {
            cardId: cardId,
            hp: hpInt,
            rarityId: prismaRarity!.id,
            extensionId: prismaExtension.id,
        },
        create: {
            cardId: cardId,
            hp: hpInt,
            rarityId: prismaRarity!.id,
            extensionId: prismaExtension.id,
        }
    });
    const prismaCardI18nEN = prisma.cardI18n.upsert({
        where: {
            cardId_language: {
                cardId: prismaCard.cardId,
                language: "en",
            }
        },
        update: {

        },
        create: {
            cardId: prismaCard.cardId,
            language: "en",
            name: cardName,
            imgUrl: imgSrc,
        }
    });
    const prismaCardI18nFR = prisma.cardI18n.upsert({
        where: {
            cardId_language: {
                cardId: prismaCard.cardId,
                language: "fr",
            }
        },
        update: {

        },
        create: {
            cardId: prismaCard.cardId,
            language: "fr",
            name: cardNameFR,
            imgUrl: imgSrcFR,
        }
    });
    await Promise.all([prismaCardI18nEN, prismaCardI18nFR]);
}

async function fetchExtension(extensionLink: string, prismaExtension: any){

    const axiosRequest = axios.get(extensionLink);
    const axiosResponse = await axiosRequest;
    const page = load(axiosResponse.data);
    const allCards = page("div.card-search-grid a");
    let promises = [];
    for(let card of allCards){
        const cardLink = "https://limitlesstcg.com"+card.attribs["href"];
        console.log("fetching card "+cardLink);
        promises.push(fetchCard(cardLink, prismaExtension));
        if(promises.length>20){
            await Promise.all(promises);
            promises = [];
        }
    }
    await Promise.all(promises);
};
async function allExtension(skip: string[]){
    const allExtensionLink = "https://limitlesstcg.com/cards/en";
    const allExtensionAxios = axios.get(allExtensionLink);
    const allExtensionResponse = await allExtensionAxios;
    const page = load(allExtensionResponse.data);
    const allSeries = page("th.sub-heading");

    let prismaGame = await prisma.game.upsert({
        where: {
            name: "Pokemon TCG",
        },
        update: {

        },
        create: {
            name: "Pokemon TCG",
        }
    });

    let serieName = "";
    let prismaSerie = null;
    for(let row of page("tr")){
        const serie = row.childNodes.find((node) => node.type == "tag" && node.name == "th" && node.attribs["class"] == "sub-heading");
        if(serie){
            // @ts-ignore
            serieName = serie.children[0].data;
            prismaSerie = await prisma.series.upsert({
                where: {
                    name: serieName,
                },
                update: {

                },
                create: {
                    name: serieName,
                    gameId: prismaGame.id,
                    acronym: serieName,
                }
            })
        }
        // @ts-ignore
        const extensionCol = row.childNodes.find((node) => node.type == "tag" && node.name == "td");

        if(extensionCol){
            // @ts-ignore
            const extensionATag = extensionCol.children[0]?.type == "tag" && extensionCol.children[0]?.name == "a" ? extensionCol.children[0] : null;
            if(extensionATag && extensionATag.children.length== 3){
                const extensionLink = extensionATag.attribs["href"];
                const extensionName = extensionATag.children[1].data;
                const extensionAcr = extensionATag.children[2].children[0].data;
                if(skip.includes(extensionAcr)){
                    console.log("skipping "+extensionAcr);
                    continue;
                }

                console.assert(prismaSerie !== null, "prismaSeries !== null");
                console.log("creating extension "+extensionName+" ("+extensionAcr+")");
                let prismaExtension = await prisma.extension.upsert({
                    where: {
                        acronym: extensionAcr,
                    },
                    update: {
                        name: extensionName,
                        acronym: extensionAcr,
                    },
                    create: {
                        name: extensionName,
                        acronym: extensionAcr,
                        seriesId: prismaSerie!.id,
                    }
                });

                await fetchExtension("https://limitlesstcg.com"+extensionLink, prismaExtension);
            }
        }

    }
}

allExtension(["PAL", "SVI", "SVP", "CRZ", "SIT"])