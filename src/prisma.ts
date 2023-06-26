import {Prisma, PrismaClient} from '@prisma/client'
import { createPrismaRedisCache } from "prisma-redis-middleware";
import Redis from "ioredis";
import Middleware = Prisma.Middleware;

export const redis = new Redis(
    {
        host: process.env.REDISHOST,
        port: parseInt(process.env.REDISPORT as string),
        password: process.env.REDISPASSWORD,
        username: process.env.REDISUSER,
    }
); // Uses default options for Redis connection

const cacheMiddleware: Middleware = createPrismaRedisCache({
    storage: { type: "redis", options: { client: redis, invalidation: { referencesTTL: 900 }} },
    cacheTime: 900,
    onHit: (key) => {
        //console.log("hit", key);
    },
    onMiss: (key) => {
        //console.log("miss", key);
    },
    onError: (key) => {
        console.log("error", key);
    },
});

export const prisma = new PrismaClient()

prisma.$use(cacheMiddleware);
