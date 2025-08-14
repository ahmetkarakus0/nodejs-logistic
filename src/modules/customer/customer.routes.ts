import { Router } from 'express';
import { asyncHandler } from '@/middlewares/async-handler';
import { authMiddleware } from '@/middlewares/auth';
import { validate } from '@/middlewares/validate';
import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
} from '@/modules/customer/customer.controller';
import {
  createCustomerSchema,
  updateCustomerSchema,
} from '@/modules/customer/customer.validator';

const customerRoutes = Router();

/**
 * @description Apply auth middleware to all customer routes
 */
customerRoutes.use(authMiddleware);

/**
 * @description Get all customers.
 */
customerRoutes.get('/', asyncHandler(getCustomers));

/**
 * @description Create a new customer.
 */
customerRoutes.post(
  '/',
  validate(createCustomerSchema),
  asyncHandler(createCustomer),
);

/**
 * @description Update a customer.
 */
customerRoutes.put(
  '/:id',
  validate(updateCustomerSchema),
  asyncHandler(updateCustomer),
);

/**
 * @description Delete a customer.
 */
customerRoutes.delete('/:id', asyncHandler(deleteCustomer));

export default customerRoutes;
