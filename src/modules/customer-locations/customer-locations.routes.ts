import { asyncHandler } from '@/middlewares/async-handler';
import { authMiddleware } from '@/middlewares/auth';
import { onlyAdminMiddleware } from '@/middlewares/only-admin';
import { validate } from '@/middlewares/validate';
import {
  createCustomerLocation,
  deleteCustomerLocation,
  getCustomerLocations,
  updateCustomerLocation,
} from '@/modules/customer-locations/customer-locations.controller';
import {
  createCustomerLocationSchema,
  updateCustomerLocationSchema,
} from '@/modules/customer-locations/customer-locations.validators';
import { Router } from 'express';

const customerLocationsRoutes = Router();

/**
 * @description Apply auth and onlyAdmin middlewares to all customer locations routes
 */
customerLocationsRoutes.use(authMiddleware, onlyAdminMiddleware);

/**
 * @description Get all customer locations.
 */
customerLocationsRoutes.get('/', asyncHandler(getCustomerLocations));

/**
 * @description Create a new customer location.
 */
customerLocationsRoutes.post(
  '/',
  validate(createCustomerLocationSchema),
  asyncHandler(createCustomerLocation),
);

/**
 * @description Update a customer location.
 */
customerLocationsRoutes.put(
  '/:id',
  validate(updateCustomerLocationSchema),
  asyncHandler(updateCustomerLocation),
);

/**
 * @description Delete a customer location.
 */
customerLocationsRoutes.delete('/:id', asyncHandler(deleteCustomerLocation));

export default customerLocationsRoutes;
