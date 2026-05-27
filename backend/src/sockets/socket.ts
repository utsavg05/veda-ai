import type { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from '../config/env';
import { createRedisClient } from '../config/redis';

const SOCKET_CHANNEL = 'assignment-updates';

let io: SocketIOServer | null = null;
let subscriber: ReturnType<typeof createRedisClient> | null = null;
const publisher = createRedisClient() as {
  publish: (channel: string, message: string) => Promise<number>;
};

(publisher as { on?: (event: string, listener: (...args: unknown[]) => void) => void }).on?.(
  'error',
  () => undefined,
);

export const initSocket = (server: HttpServer): SocketIOServer => {
  if (io) {
    return io;
  }

  io = new SocketIOServer(server, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.emit('connected', {
      success: true,
      message: 'Socket connected',
    });
  });

  if (!subscriber) {
    subscriber = createRedisClient();
    (subscriber as { on?: (event: string, listener: (...args: unknown[]) => void) => void }).on?.(
      'error',
      () => undefined,
    );
    (subscriber as { subscribe: (channel: string) => Promise<unknown> }).subscribe(SOCKET_CHANNEL).catch((error: unknown) => {
      console.error('Socket subscriber failed to subscribe', error);
    });

    (subscriber as {
      on: (event: 'message', listener: (_channel: string, message: string) => void) => void;
    }).on('message', (_channel: string, message: string) => {
      if (!io) {
        return;
      }

      try {
        const parsedMessage = JSON.parse(message) as {
          eventName?: string;
          payload?: unknown;
        };

        if (parsedMessage.eventName) {
          io.emit(parsedMessage.eventName, parsedMessage.payload);
        }
      } catch (error) {
        console.error('Failed to relay socket event', error);
      }
    });
  }

  return io;
};

export const getIO = (): SocketIOServer | null => io;

export const emitAssignmentUpdate = async (eventName: string, payload: unknown): Promise<void> => {
  try {
    if (io) {
      io.emit(eventName, payload);
    }

    await publisher.publish(
      SOCKET_CHANNEL,
      JSON.stringify({
        eventName,
        payload,
      }),
    );
  } catch (error) {
    console.error('Failed to emit assignment update', error);
  }
};