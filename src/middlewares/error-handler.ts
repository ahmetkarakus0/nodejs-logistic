import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../errors/http-error';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details || undefined,
    });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({
    error: 'Internal server error',
  });
};
