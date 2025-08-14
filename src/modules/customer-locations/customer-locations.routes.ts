import { Router } from 'express';
import { authMiddleware } from '@/middlewares/auth';
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
import { asyncHandler } from '@/middlewares/async-handler';

const customerLocationsRoutes = Router();

/**
 * @description Apply auth middleware to all customer locations routes
 */
customerLocationsRoutes.use(authMiddleware);

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
