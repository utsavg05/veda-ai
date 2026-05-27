import { connectDB } from './config/db.js';
import { startAssignmentWorker } from './queues/assignment.worker.js';

const startWorker = async (): Promise<void> => {
  await connectDB();
  startAssignmentWorker();
  console.log('Assignment worker started');
};

void startWorker();