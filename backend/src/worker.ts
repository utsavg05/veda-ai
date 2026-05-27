import { connectDB } from './config/db';
import { startAssignmentWorker } from './queues/assignment.worker';

const startWorker = async (): Promise<void> => {
  await connectDB();
  startAssignmentWorker();
  console.log('Assignment worker started');
};

void startWorker();