import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validate =
  (schema: z.ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const zodError = err as z.ZodError;
        return res.status(400).json({
          errors: zodError.issues.map((e) => ({
            message: e.message,
          })),
        });
      }

      return res.status(400).json({ error: err });
    }
  };
