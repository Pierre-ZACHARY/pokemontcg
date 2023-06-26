import { CommandInteraction, Client } from "discord.js";
import { Command } from "../Command";
import {prisma} from "../../prisma";
import {getLang} from "../utils/getLang";

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

export const ClaimTcg: Command = {
    name: "claimtcg",
    description: "Claim your daily coins ( max 200 )",
    type: 1, // Chat input
    run: async (client: Client, interaction: CommandInteraction) => {

        let user = await prisma.user.findFirst({
            where: {
                discordId: interaction.user.id
            }
        })!;
        console.assert(user !== null, "User is null after guard");
        let claimAmount = 0;
        const lang = getLang(user!.language);
        let content = lang.alreadyClaimed;
        if(!user!.lastClaim){
            content = lang.firstClaim.fmt(interaction.user.username);
            claimAmount = 400;
        }
        // 6 hours in milliseconds is 21600000
        else if(user!.lastClaim.getTime() + 21600000 < Date.now()){
            if(user!.lastClaim.getDay() <= new Date().getDay()-1){
                user = await prisma.user.update({
                    where: {
                        id: user!.id
                    },
                    data: {
                        dailyCoinsReceived: 0
                    }
                });
            }
            if(user!.dailyCoinsReceived < user!.dailyCoins){
                const canReceiveMax = user!.dailyCoins - user!.dailyCoinsReceived;
                claimAmount = Math.min(200, (Date.now()-user!.lastClaim!.getTime()/21600000)*100, canReceiveMax);
            }
        }
        if(claimAmount !== 0){
            user = await prisma.user.update({
                where: {
                    id: user!.id
                },
                data: {
                    coins: {
                        increment: claimAmount
                    }
                }
            })
            content = lang.claimAmount.fmt(claimAmount);
        }

        await interaction.followUp({
            ephemeral: true,
            content
        });
    }
};