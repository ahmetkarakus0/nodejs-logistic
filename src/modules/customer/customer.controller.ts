import { Request, Response } from 'express';
import { BadRequestError } from '../../errors/http-error';
import {
  createCustomerService,
  deleteCustomerService,
  getCustomersService,
  updateCustomerService,
} from './customer.service';
import { GetCustomersFilters } from './customer.types';

/**
 * @route GET /customer
 */
export const getCustomers = async (req: Request, res: Response) => {
  const filters: GetCustomersFilters = {};

  const { pageIndex, pageSize, ...rest } =
    req.query as unknown as GetCustomersFilters & {
      pageIndex: number;
      pageSize: number;
    };

  Object.entries(rest).forEach(([key, value]) => {
    filters[key as keyof GetCustomersFilters] = value as string;
  });

  const customers = await getCustomersService(
    filters,
    pageIndex,
    pageSize,
    req.user!.id,
  );
  res.status(200).json(customers);
};

/**
 * @route POST /customer
 */
export const createCustomer = async (req: Request, res: Response) => {
  const customer = await createCustomerService(req.body, req.user!.id);
  res.status(201).json(customer);
};

/**
 * @route PUT /customer/:id
 */
export const updateCustomer = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) {
    throw new BadRequestError('ID is required');
  }
  const customer = await updateCustomerService(id, req.body, req.user!.id);
  res.status(200).json(customer);
};

/**
 * @route DELETE /customer/:id
 */
export const deleteCustomer = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) {
    throw new BadRequestError('ID is required');
  }
  const customer = await deleteCustomerService(id, req.user!.id);
  res.status(200).json(customer);
};
