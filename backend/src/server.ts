import http from 'http';
import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { initSocket } from './sockets/socket';

const startServer = async (): Promise<void> => {
  await connectDB();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
};

void startServer();