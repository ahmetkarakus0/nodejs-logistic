import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
} from '@/errors/http-error';
import {
  PublicCustomer,
  toPublicCustomer,
} from '@/modules/customers/customers.helpers';
import {
  deleteCustomer,
  getCustomerById,
  getCustomerByUserId,
  getCustomers,
  insertCustomer,
  updateCustomer,
} from '@/modules/customers/customers.repository';
import {
  GetCustomersFilters,
  ICustomer,
} from '@/modules/customers/customers.types';
import { getUserById } from '@/modules/auth/auth.repository';
import {
  getCachedList,
  invalidateCachedList,
  setCachedList,
} from '@/utils/redis/filter-list-helpers';
import { deleteCustomerLocationsByCustomerId } from '../customer-locations/customer-locations.repository';
import { EUserRole } from '@/modules/auth/auth.types';

/**
 * @param {GetCustomersFilters} filters - The filters to apply to the customers
 * @param {number} pageIndex - The page index
 * @param {number} pageSize - The page size
 *
 * @returns {Promise<PaginatedResponse<PublicCustomer>>} The customers with pagination data
 */
export const getCustomersService = async (
  filters: GetCustomersFilters,
  pageIndex: number,
  pageSize: number,
  userId: string,
): Promise<PaginatedResponse<PublicCustomer>> => {
  const { data: cachedData, cacheKey } = await getCachedList<
    PublicCustomer,
    GetCustomersFilters
  >(filters, pageIndex, pageSize, userId, 'customers');
  if (cachedData) {
    return cachedData;
  }

  const fetchedData = await getCustomers(filters, pageIndex, pageSize);
  if (!fetchedData) {
    throw new InternalServerError('Failed to fetch customers');
  }

  const responseData = {
    items: fetchedData.items.map(toPublicCustomer),
    pageIndex,
    pageSize,
    total: fetchedData.total,
    totalPages: Math.ceil(fetchedData.total / pageSize),
  };

  await setCachedList(cacheKey, responseData);

  return responseData;
};

/**
 * @param {ICustomer} customer - The customer to create
 * @param {string} userId - The user ID
 *
 * @returns {Promise<{ message: string; customer: PublicCustomer }>} The message and the customer
 */
export const createCustomerService = async (
  customer: ICustomer,
  userId: string,
): Promise<{ message: string; customer: PublicCustomer }> => {
  const foundUser = await getUserById(customer.user_id);
  if (!foundUser) {
    throw new NotFoundError('User not found');
  }
  if (foundUser.role !== EUserRole.CUSTOMER) {
    throw new BadRequestError('User is not a customer');
  }

  const foundCustomer = await getCustomerByUserId(customer.user_id);
  if (foundCustomer) {
    throw new BadRequestError('Customer already exists');
  }

  const newCustomer = await insertCustomer(customer);
  if (!newCustomer) {
    throw new InternalServerError('Failed to create customer');
  }

  await invalidateCachedList(userId, 'customers');

  return {
    message: 'Customer created successfully',
    customer: toPublicCustomer(newCustomer),
  };
};

/**
 * @param {ICustomer} customer - The customer to update
 * @param {string} userId - The user ID
 *
 * @returns {Promise<{ message: string; customer: PublicCustomer }>} The message and the customer
 */
export const updateCustomerService = async (
  id: string,
  customer: Partial<ICustomer>,
  userId: string,
): Promise<{ message: string; customer: PublicCustomer }> => {
  const foundCustomer = await getCustomerById(id);
  if (!foundCustomer) {
    throw new NotFoundError('Customer not found');
  }

  if (customer.user_id) {
    const foundCustomerByUserId = await getCustomerByUserId(customer.user_id);
    if (foundCustomerByUserId && foundCustomerByUserId.id !== id) {
      throw new ConflictError('Customer already exists for this user');
    }
    const foundUser = await getUserById(customer.user_id);
    if (!foundUser) {
      throw new NotFoundError('User not found');
    }
    if (foundUser.role !== EUserRole.CUSTOMER) {
      throw new BadRequestError(
        'Only customer users can be assigned to a customer',
      );
    }
  }

  if (Object.keys(customer).length === 0) {
    throw new BadRequestError('No fields to update');
  }

  const updatedCustomer = await updateCustomer(id, customer);
  if (!updatedCustomer) {
    throw new InternalServerError('Failed to update customer');
  }

  await invalidateCachedList(userId, 'customers');

  return {
    message: 'Customer updated successfully',
    customer: toPublicCustomer(updatedCustomer),
  };
};

/**
 * @param {string} id - The id of the customer to delete
 * @param {string} userId - The user ID
 *
 * @returns {Promise<{ message: string }>} The message
 */
export const deleteCustomerService = async (
  id: string,
  userId: string,
): Promise<{ message: string }> => {
  const foundCustomer = await getCustomerById(id);
  if (!foundCustomer) {
    throw new NotFoundError('Customer not found');
  }

  const deletedCustomer = await deleteCustomer(id);
  if (!deletedCustomer) {
    throw new InternalServerError('Failed to delete customer');
  }

  const deletedCustomerLocations =
    await deleteCustomerLocationsByCustomerId(id);
  if (!deletedCustomerLocations) {
    throw new InternalServerError('Failed to delete customer locations');
  }

  await invalidateCachedList(userId, 'customers');
  await invalidateCachedList(userId, 'customer-locations');

  return { message: 'Customer deleted successfully' };
};
