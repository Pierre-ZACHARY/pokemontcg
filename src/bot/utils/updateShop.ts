import {prisma} from "../../prisma";
import {Guild} from "discord.js";

function range(count: number){
    return [...Array(3).keys()];
}

export async function updateShop(guild: Guild){
    const shop = await prisma.shop.findFirst({
        where:{
            server: {
                discordId: guild.id,
            }
        },
        include: {
            server: true,
        }
    });
    console.assert(shop, "Should be created by server guard");

    if(shop!.lastUpdated.getDay() <= new Date().getDay()-1){
        // find up to 3 random booster
        const everyBooster = await prisma.booster.findMany();
        const idArray = everyBooster.map((booster)=>booster.id);
        let randomBooster= [];
        for(const i of range(3)){
            const randomIndex = Math.floor(Math.random() * idArray.length);
            randomBooster.push(everyBooster[randomIndex]);
        }
        const allGoods = await prisma.goods.findMany();
        const randomIndex = Math.floor(Math.random() * allGoods.length);
        const randomGood = allGoods[randomIndex];
        await prisma.shop.update({
            where: {
                id: shop!.id
            },
            data: {
                lastUpdated: new Date(),
                goods: {
                    set: {id: randomGood.id}
                },
                boosters: {
                    set: [
                        {id: randomBooster[0].id},
                        {id: randomBooster[1].id},
                        {id: randomBooster[2].id},
                    ]
                }
            }
        })

    }
}