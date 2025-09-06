import { createClient, type RedisClientType } from "redis";
/**
 * A Redis Client created using createClient
 */

export const redisClient: RedisClientType = createClient({ url: "redis://localhost:6379" });

/**
 * Async function use to connect to redis an return an connect client
 * @param Client
 */
export async function connectRedis():Promise<RedisClientType>  {
    const redisClient = createClient({ url: "redis://localhost:6379" });
	await redisClient.connect();
	console.log("Connected to redis 🥳");
    return redisClient as RedisClientType;
}

export type { RedisClientType };