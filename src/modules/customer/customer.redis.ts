import redis from '@/config/redis';
import { PublicCustomer } from '@/modules/customer/customer.helpers';
import { GetCustomersFilters } from '@/modules/customer/customer.types';

export const getCachedCustomers = async (
  filters: GetCustomersFilters,
  pageIndex: number,
  pageSize: number,
  userId: string,
): Promise<{
  data: PaginatedResponse<PublicCustomer> | null;
  cacheKey: string;
}> => {
  const cacheKey = `customers:${userId}:${JSON.stringify(filters)}:${pageIndex}:${pageSize}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return {
      data: JSON.parse(cached),
      cacheKey,
    };
  }

  return {
    data: null,
    cacheKey,
  };
};

export const setCachedCustomers = async (
  cacheKey: string,
  data: PaginatedResponse<PublicCustomer>,
) => {
  await redis.set(
    cacheKey,
    JSON.stringify(data),
    'EX',
    +process.env.REDIS_TTL!,
  );
};

export const invalidateCachedCustomers = async (userId: string) => {
  const prefix = `customers:${userId}`;
  let cursor = '0';

  do {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', prefix);
    cursor = nextCursor;

    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } while (cursor !== '0');
};
