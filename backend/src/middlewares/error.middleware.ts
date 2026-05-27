import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const resolveStatusCode = (error: unknown): number => {
  if (error instanceof ApiError) {
    return error.statusCode;
  }

  if (error instanceof Error && error.name === 'CastError') {
    return 400;
  }

  return 500;
};

const resolveMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Internal server error';
};

export const notFoundMiddleware = (_req: Request, _res: Response, next: NextFunction): void => {
  next(new ApiError(404, 'Route not found'));
};

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response => {
  const statusCode = resolveStatusCode(error);
  const message = resolveMessage(error);

  return res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV === 'development' && error instanceof Error
      ? {
          stack: error.stack,
        }
      : {}),
  });
};