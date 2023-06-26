


// simple redis wrapper which takes a key and a function to call if the key is not found
// the function is called with the key as argument and should return a promise
// the result of the promise is stored in redis and returned
// if the key is found, the result is returned directly
// the result is stored in redis with a ttl of 1 day
import {redis} from "../../prisma";
import {Client, User} from "discord.js";

export async function redisWrapper<T>(key: string, ttl: number, func: (key: string) => Promise<T>): Promise<T>{
    const redisClient = redis;
    const result = await redisClient.get(key);
    if(result){
        return JSON.parse(result);
    }
    else{
        const value = await func(key);
        await redisClient.set(key, JSON.stringify(value), "EX", ttl);
        return value;
    }
}

export async function discordUserRedis(discordId: string, client: Client): Promise<{username: string, avatarUrl: string }>{
    return await redisWrapper("discordUser-"+discordId, 900, async ()=>{
        const user =  await client.users.fetch(discordId);
        return {
            username: user.username,
            avatarUrl: user.avatarURL()!,
        }
    });
}