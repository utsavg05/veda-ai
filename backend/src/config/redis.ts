import Redis from 'ioredis';
import type { ConnectionOptions } from 'bullmq';
import { env } from './env';

export const redisConnectionOptions: ConnectionOptions = {
	host: env.REDIS_HOST,
	port: env.REDIS_PORT,
	maxRetriesPerRequest: null,
};

const redisClientOptions = {
	host: env.REDIS_HOST,
	port: env.REDIS_PORT,
	lazyConnect: true,
	enableReadyCheck: false,
	maxRetriesPerRequest: 1,
	retryStrategy: () => null,
};

let redisClient: unknown = null;

export const createRedisClient = (): unknown => new (Redis as unknown as new (options: Record<string, unknown>) => unknown)(redisClientOptions);

export const getRedisClient = (): unknown => {
	if (!redisClient) {
		redisClient = createRedisClient();
	}

	return redisClient;
};
