import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from '@/errors/http-error';
import { getUserById } from '@/modules/auth/auth.repository';
import { EUserRole } from '@/modules/auth/auth.types';
import {
  deleteDriver,
  getDriverById,
  getDriverByUserId,
  getDrivers,
  insertDriver,
  updateDriver,
} from '@/modules/drivers/drivers.repository';
import { GetDriversFilters, IDriver } from '@/modules/drivers/drivers.types';
import {
  getCachedList,
  invalidateCachedList,
  setCachedList,
} from '@/utils/redis/filter-list-helpers';

/**
 * @param {GetDriversFilters} filters - The filters to apply to the drivers
 * @param {number} pageIndex - The page index
 * @param {number} pageSize - The page size
 * @param {string} userId - The user ID
 *
 * @returns {Promise<PaginatedResponse<IDriver>>} The drivers with pagination data
 */
export const getDriversService = async (
  filters: GetDriversFilters,
  pageIndex: number,
  pageSize: number,
  userId: string,
): Promise<PaginatedResponse<IDriver>> => {
  const { data: cachedData, cacheKey } = await getCachedList<
    IDriver,
    GetDriversFilters
  >(filters, pageIndex, pageSize, userId, 'drivers');

  if (cachedData) {
    return cachedData;
  }

  const fetchedData = await getDrivers(filters, pageIndex, pageSize);

  if (!fetchedData) {
    throw new InternalServerError('Failed to fetch drivers');
  }

  const responseData = {
    items: fetchedData.items,
    pageIndex,
    pageSize,
    total: fetchedData.total,
    totalPages: Math.ceil(fetchedData.total / pageSize),
  };

  await setCachedList(cacheKey, responseData);

  return responseData;
};

/**
 * @param {IDriver} driver - The driver to create
 * @param {string} userId - The user ID
 *
 * @returns {Promise<{ message: string; data: IDriver }>} The created driver with message
 */
export const createDriverService = async (
  driver: IDriver,
  userId: string,
): Promise<{ message: string; data: IDriver }> => {
  const foundUser = await getUserById(driver.user_id);
  if (!foundUser) {
    throw new NotFoundError('User not found');
  }
  if (foundUser.role !== EUserRole.DRIVER) {
    throw new BadRequestError('User is not a driver');
  }

  const existingDriver = await getDriverByUserId(driver.user_id);
  if (existingDriver) {
    throw new BadRequestError('Driver already exists');
  }

  const newDriver = await insertDriver(driver);
  if (!newDriver) {
    throw new InternalServerError('Failed to create driver');
  }

  await invalidateCachedList(userId, 'drivers');

  return {
    message: 'Driver created successfully',
    data: newDriver,
  };
};

/**
 * @param {string} id - The id of the driver to update
 * @param {Partial<IDriver>} driver - The driver to update
 * @param {string} userId - The user ID
 *
 * @returns {Promise<{ message: string; data: IDriver }>} The updated driver with message
 */
export const updateDriverService = async (
  id: string,
  driver: Partial<IDriver>,
  userId: string,
): Promise<{ message: string; data: IDriver }> => {
  const foundDriver = await getDriverById(id);
  if (!foundDriver) {
    throw new NotFoundError('Driver not found');
  }

  if (driver.user_id) {
    const foundUser = await getUserById(driver.user_id);
    if (!foundUser) {
      throw new NotFoundError('User not found');
    }
    if (foundUser.role !== EUserRole.DRIVER) {
      throw new BadRequestError('User is not a driver');
    }
  }

  const updatedDriver = await updateDriver(id, driver);
  if (!updatedDriver) {
    throw new InternalServerError('Failed to update driver');
  }

  await invalidateCachedList(userId, 'drivers');

  return {
    message: 'Driver updated successfully',
    data: updatedDriver,
  };
};

/**
 * @param {string} id - The id of the driver to delete
 * @param {string} userId - The user ID
 *
 * @returns {Promise<{ message: string }>} The message
 */
export const deleteDriverService = async (
  id: string,
  userId: string,
): Promise<{ message: string }> => {
  const foundDriver = await getDriverById(id);
  if (!foundDriver) {
    throw new NotFoundError('Driver not found');
  }

  const deletedDriver = await deleteDriver(id);
  if (!deletedDriver) {
    throw new InternalServerError('Failed to delete driver');
  }

  await invalidateCachedList(userId, 'drivers');

  return {
    message: 'Driver deleted successfully',
  };
};
