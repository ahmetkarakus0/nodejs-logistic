import redis from '@/config/redis';

export const getCachedList = async <T, K>(
  filters: K,
  pageIndex: number,
  pageSize: number,
  userId: string,
  prefix: string,
): Promise<{
  data: PaginatedResponse<T> | null;
  cacheKey: string;
}> => {
  const cacheKey = `${prefix}:${userId}:${JSON.stringify(filters)}:${pageIndex}:${pageSize}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return {
      data: JSON.parse(cached) as PaginatedResponse<T>,
      cacheKey,
    };
  }

  return {
    data: null,
    cacheKey,
  };
};

export const setCachedList = async <T>(
  cacheKey: string,
  data: PaginatedResponse<T>,
) => {
  await redis.set(
    cacheKey,
    JSON.stringify(data),
    'EX',
    +process.env.REDIS_TTL!,
  );
};

export const invalidateCachedList = async (userId: string, prefix: string) => {
  let cursor = '0';

  do {
    const [nextCursor, keys] = await redis.scan(
      cursor,
      'MATCH',
      `${prefix}:${userId}`,
    );
    cursor = nextCursor;

    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } while (cursor !== '0');
};
