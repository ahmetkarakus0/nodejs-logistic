import * as dotenv from 'dotenv';
import * as path from 'path';

const env = process.env.NODE_ENV || 'development';

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${env}`),
});

export const config = {
  port: process.env.PORT || 8000,
  dbUrl:
    process.env.DATABASE_URL ||
    'postgresql://postgres:admin@localhost:5432/logistic',
  redisUrl: process.env.REDIS_URL || '',
};
