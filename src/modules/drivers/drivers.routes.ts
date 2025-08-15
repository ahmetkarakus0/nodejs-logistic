import { asyncHandler } from '@/middlewares/async-handler';
import { authMiddleware } from '@/middlewares/auth';
import { onlyAdminMiddleware } from '@/middlewares/only-admin';
import { validate } from '@/middlewares/validate';
import {
  createDriver,
  deleteDriver,
  getDrivers,
  updateDriver,
} from '@/modules/drivers/drivers.controller';
import {
  createDriverSchema,
  updateDriverSchema,
} from '@/modules/drivers/drivers.validators';
import { Router } from 'express';

export const driverRoutes = Router();

/**
 * @description Apply auth and onlyAdmin middlewares to all driver routes
 */
driverRoutes.use(authMiddleware, onlyAdminMiddleware);

/**
 * @description Get all drivers.
 */
driverRoutes.get('/', asyncHandler(getDrivers));

/**
 * @description Create a new driver.
 */
driverRoutes.post(
  '/',
  validate(createDriverSchema),
  asyncHandler(createDriver),
);

/**
 * @description Update a driver.
 */
driverRoutes.put(
  '/:id',
  validate(updateDriverSchema),
  asyncHandler(updateDriver),
);

/**
 * @description Delete a driver.
 */
driverRoutes.delete('/:id', asyncHandler(deleteDriver));

export default driverRoutes;
