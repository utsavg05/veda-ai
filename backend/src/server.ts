import http from 'http';
import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { initSocket } from './sockets/socket';

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
  } catch (error) {
    console.error('Failed to connect to MongoDB on startup, continuing without DB:', error);
  }

  const server = http.createServer(app);
  initSocket(server);

  server.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
};

void startServer();