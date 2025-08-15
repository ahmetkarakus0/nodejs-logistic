import { BadRequestError } from '@/errors/http-error';
import {
  createDriverService,
  deleteDriverService,
  getDriversService,
  updateDriverService,
} from '@/modules/drivers/drivers.service';
import { Request, Response } from 'express';
import { GetDriversFilters } from './drivers.types';

/**
 * @route GET /drivers
 */
export const getDrivers = async (req: Request, res: Response) => {
  const filters: GetDriversFilters = {};

  const { pageIndex, pageSize, ...rest } =
    req.query as unknown as GetDriversFilters & {
      pageIndex: number;
      pageSize: number;
    };

  Object.entries(rest).forEach(([key, value]) => {
    filters[key as keyof GetDriversFilters] = value as never;
  });

  const drivers = await getDriversService(
    filters,
    pageIndex,
    pageSize,
    req.user!.id,
  );
  res.status(200).json(drivers);
};

/**
 * @route POST /drivers
 */
export const createDriver = async (req: Request, res: Response) => {
  const driver = req.body;
  const result = await createDriverService(driver, req.user!.id);
  res.status(201).json(result);
};

/**
 * @route PUT /drivers/:id
 */
export const updateDriver = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new BadRequestError('Driver ID is required');
  }

  const driver = req.body;
  const result = await updateDriverService(id, driver, req.user!.id);
  res.status(200).json(result);
};

/**
 * @route DELETE /drivers/:id
 */
export const deleteDriver = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new BadRequestError('Driver ID is required');
  }
  const result = await deleteDriverService(id, req.user!.id);
  res.status(200).json(result);
};
