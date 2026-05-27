import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { initSocket } from './sockets/socket.js';

const startServer = async (): Promise<void> => {
  await connectDB();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
};

void startServer();