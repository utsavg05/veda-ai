import { Worker } from 'bullmq';
import { redisConnectionOptions } from '../config/redis.js';
import { failAssignmentJob, processAssignmentJob } from '../controllers/assignment.controller.js';
import { ASSIGNMENT_QUEUE_NAME } from './assignment.queue.js';

export const startAssignmentWorker = (): Worker => {
  const worker = new Worker(
    ASSIGNMENT_QUEUE_NAME,
    async (job) => {
      const { assignmentId } = job.data as { assignmentId: string };

      try {
        await processAssignmentJob(assignmentId);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Assignment generation failed';
        await failAssignmentJob(assignmentId, message);
        throw error;
      }
    },
    {
      connection: redisConnectionOptions,
      concurrency: 1,
    },
  );

  worker.on('completed', (job) => {
    console.log(`Assignment job completed: ${job.id}`);
  });

  worker.on('failed', (job, error) => {
    console.error(`Assignment job failed: ${job?.id}`, error);
  });

  return worker;
};