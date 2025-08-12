import { NextFunction, Request, Response } from 'express';
import z from 'zod';

export const validateHeader =
  (schema: z.ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const headers = req.headers;
      const parsedHeaders = schema.parse(headers);
      req.headers = parsedHeaders as Record<string, any>;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          errors: error.issues.map((e) => ({
            message: e.message,
          })),
        });
      }
      return res.status(400).json({ error: error });
    }
  };
