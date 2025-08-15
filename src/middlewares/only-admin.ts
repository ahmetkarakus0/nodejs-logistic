import { EUserRole } from '@/modules/auth/auth.types';
import { NextFunction, Request, Response } from 'express';

export const onlyAdminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userRole = req.user?.role;

    if (userRole !== EUserRole.ADMIN) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};
