import Redis, { type RedisOptions } from 'ioredis';
import { env } from './env.js';

export const redisConnectionOptions: RedisOptions = {
	host: env.REDIS_HOST,
	port: env.REDIS_PORT,
	maxRetriesPerRequest: null,
};

let redisClient: Redis | null = null;

export const createRedisClient = (): Redis => new Redis(redisConnectionOptions);

export const getRedisClient = (): Redis => {
	if (!redisClient) {
		redisClient = createRedisClient();
	}

	return redisClient;
};
