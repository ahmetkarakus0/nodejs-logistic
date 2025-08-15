import { BadRequestError, InternalServerError } from '@/errors/http-error';
import {
  GetCustomerLocationsFilters,
  ICustomerLocation,
} from '@/modules/customer-locations/customer-locations.types';
import { getCustomerById } from '@/modules/customers/customers.repository';
import {
  deleteCustomerLocation,
  getCustomerLocationById,
  getCustomerLocations,
  insertCustomerLocation,
  updateCustomerLocation,
} from '@/modules/customer-locations/customer-locations.repository';
import {
  getCachedList,
  invalidateCachedList,
  setCachedList,
} from '@/utils/redis/filter-list-helpers';

/**
 * @param {GetCustomerLocationsFilters} filters - The filters to apply to the customer locations
 * @param {number} pageIndex - The page index
 * @param {number} pageSize - The page size
 * @param {string} userId - The user ID
 *
 * @returns {Promise<PaginatedResponse<ICustomerLocation>>} The customer locations with pagination data
 */
export const getCustomerLocationsService = async (
  filters: GetCustomerLocationsFilters,
  pageIndex: number,
  pageSize: number,
  userId: string,
): Promise<PaginatedResponse<ICustomerLocation>> => {
  const { data: cachedData, cacheKey } = await getCachedList<
    ICustomerLocation,
    GetCustomerLocationsFilters
  >(filters, pageIndex, pageSize, userId, 'customer-locations');

  if (cachedData) {
    return cachedData;
  }

  const fetchedData = await getCustomerLocations(filters, pageIndex, pageSize);

  if (!fetchedData) {
    throw new InternalServerError('Failed to fetch customer locations');
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
 * @param {ICustomerLocation} customerLocation - The customer location to create
 * @param {string} userId - The user ID
 *
 * @returns {Promise<{ message: string; data: ICustomerLocation }>} The created customer location
 */
export const createCustomerLocationService = async (
  customerLocation: ICustomerLocation,
  userId: string,
): Promise<{ message: string; data: ICustomerLocation }> => {
  const foundCustomer = await getCustomerById(customerLocation.customer_id);
  if (!foundCustomer) {
    throw new BadRequestError('Customer not found');
  }

  const createdCustomerLocation =
    await insertCustomerLocation(customerLocation);
  if (!createdCustomerLocation) {
    throw new InternalServerError('Failed to create customer location');
  }

  await invalidateCachedList(userId, 'customer-locations');

  return {
    message: 'Customer location created successfully',
    data: createdCustomerLocation,
  };
};

/**
 * @param {string} id - The ID of the customer location to update
 * @param {Partial<ICustomerLocation>} customerLocation - The customer location to update
 * @param {string} userId - The user ID
 *
 * @returns {Promise<{ message: string; data: ICustomerLocation }>} The updated customer location
 */
export const updateCustomerLocationService = async (
  id: string,
  customerLocation: Partial<ICustomerLocation>,
  userId: string,
): Promise<{ message: string; data: ICustomerLocation }> => {
  const foundCustomerLocation = await getCustomerLocationById(id);
  if (!foundCustomerLocation) {
    throw new BadRequestError('Customer location not found');
  }

  if (customerLocation.customer_id) {
    const foundCustomer = await getCustomerById(customerLocation.customer_id);
    if (!foundCustomer) {
      throw new BadRequestError('Customer not found');
    }
  }

  const updatedCustomerLocation = await updateCustomerLocation(
    id,
    customerLocation,
  );

  if (!updatedCustomerLocation) {
    throw new InternalServerError('Failed to update customer location');
  }

  await invalidateCachedList(userId, 'customer-locations');

  return {
    message: 'Customer location updated successfully',
    data: updatedCustomerLocation,
  };
};

/**
 * @param {string} id - The ID of the customer location to delete
 * @param {string} userId - The user ID
 *
 * @returns {Promise<{ message: string }>} The message
 */
export const deleteCustomerLocationService = async (
  id: string,
  userId: string,
): Promise<{ message: string }> => {
  const foundCustomerLocation = await getCustomerLocationById(id);
  if (!foundCustomerLocation) {
    throw new BadRequestError('Customer location not found');
  }

  const deletedCustomerLocation = await deleteCustomerLocation(id);
  if (!deletedCustomerLocation) {
    throw new InternalServerError('Failed to delete customer location');
  }

  await invalidateCachedList(userId, 'customer-locations');

  return { message: 'Customer location deleted successfully' };
};
