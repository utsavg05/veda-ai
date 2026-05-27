import { Queue } from 'bullmq';
import { redisConnectionOptions } from '../config/redis.js';

export const ASSIGNMENT_QUEUE_NAME = 'assignment-generation';

export const assignmentQueue = new Queue(ASSIGNMENT_QUEUE_NAME, {
  connection: redisConnectionOptions,
});

export const enqueueAssignmentGeneration = async (assignmentId: string): Promise<void> => {
  await assignmentQueue.add(
    'generate-assignment',
    {
      assignmentId,
    },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    },
  );
};