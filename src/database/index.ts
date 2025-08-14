import { Pool } from 'pg';
import { config } from '@/config/env';

export const createPool = async () => {
  const pool = new Pool({
    connectionString: config.dbUrl,
  });

  pool.on('error', (err) => {
    console.error(err);
  });

  return pool;
};
