import {User} from "discord.js";
import {prisma} from "../../prisma";
import {Prisma} from ".prisma/client";
import Prisma__UserClient = Prisma.Prisma__UserClient;
import {GetResult} from "@prisma/client/runtime";
import {DefaultArgs} from "prisma/prisma-client/runtime";


export async function userGuard(user: User){
    const clientid = user.id;
    let prismaUser = await prisma.user.findFirst({
        where: {
            discordId: clientid
        }
    })
    if(!prismaUser){
         await prisma.user.create({
            data: {
                discordId: clientid,
                coins: 0,
                lastClaim: undefined,
            }
        })
    }
}