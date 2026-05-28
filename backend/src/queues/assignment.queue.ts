import { Queue } from 'bullmq';
import { redisConnectionOptions } from '../config/redis';

export const ASSIGNMENT_QUEUE_NAME = 'assignment-generation';

let assignmentQueue: Queue | null = null;

export const getAssignmentQueue = (): Queue => {
  if (!assignmentQueue) {
    assignmentQueue = new Queue(ASSIGNMENT_QUEUE_NAME, {
      connection: redisConnectionOptions,
    });
  }

  return assignmentQueue;
};

export const enqueueAssignmentGeneration = async (assignmentId: string): Promise<void> => {
  const queue = getAssignmentQueue();
  await queue.add(
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