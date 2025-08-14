import { BadRequestError } from '@/errors/http-error';
import {
  createCustomerLocationService,
  deleteCustomerLocationService,
  getCustomerLocationsService,
  updateCustomerLocationService,
} from '@/modules/customer-locations/customer-locations.service';
import { Request, Response } from 'express';
import { GetCustomerLocationsFilters } from '@/modules/customer-locations/customer-locations.types';

export const getCustomerLocations = async (req: Request, res: Response) => {
  const filters: GetCustomerLocationsFilters = {};

  const { pageIndex, pageSize, ...rest } =
    req.query as unknown as GetCustomerLocationsFilters & {
      pageIndex: number;
      pageSize: number;
    };

  Object.entries(rest).forEach(([key, value]) => {
    filters[key as keyof GetCustomerLocationsFilters] = value as never;
  });

  const customers = await getCustomerLocationsService(
    filters,
    pageIndex,
    pageSize,
    req.user!.id,
  );
  res.status(200).json(customers);
};

/**
 * @route POST /api/v1/customer-locations
 */
export const createCustomerLocation = async (req: Request, res: Response) => {
  const createdCustomerLocation = await createCustomerLocationService(
    req.body,
    req.user!.id,
  );
  res.status(201).json(createdCustomerLocation);
};

/**
 * @route PUT /api/v1/customer-locations/:id
 */
export const updateCustomerLocation = async (req: Request, res: Response) => {
  if (!req.params.id) {
    throw new BadRequestError('Customer location ID is required');
  }

  const updatedCustomerLocation = await updateCustomerLocationService(
    req.params.id as string,
    req.body,
    req.user!.id,
  );
  res.status(200).json(updatedCustomerLocation);
};

/**
 * @route DELETE /api/v1/customer-locations/:id
 */
export const deleteCustomerLocation = async (req: Request, res: Response) => {
  if (!req.params.id) {
    throw new BadRequestError('Customer location ID is required');
  }

  const deletedCustomerLocation = await deleteCustomerLocationService(
    req.params.id as string,
    req.user!.id,
  );
  res.status(200).json(deletedCustomerLocation);
};
