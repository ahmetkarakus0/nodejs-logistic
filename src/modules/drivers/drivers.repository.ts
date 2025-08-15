import { createPool } from '@/database';
import { createFilterQueryAndValues } from '@/modules/drivers/drivers.helpers';
import { GetDriversFilters, IDriver } from '@/modules/drivers/drivers.types';

export const getDrivers = async (
  filters: GetDriversFilters,
  pageIndex: number,
  pageSize: number,
): RepoPromise<{ items: IDriver[]; total: number }> => {
  const pool = await createPool();

  const { filterQuery, filterValues } = createFilterQueryAndValues(
    filters,
    pageIndex,
    pageSize,
  );

  const query = `SELECT * FROM drivers ${filterQuery}`;
  const result = await pool.query(query, filterValues);

  const countQuery = `SELECT COUNT(*) FROM drivers ${filterQuery}`;
  const countResult = await pool.query(countQuery, filterValues);
  const total = +countResult.rows[0]?.count || 0;

  return { items: result.rows as IDriver[], total };
};

export const insertDriver = async (driver: IDriver): RepoPromise<IDriver> => {
  const pool = await createPool();

  const keys = Object.keys(driver);
  const values = Object.values(driver);

  const query = `
        INSERT INTO drivers (${keys.join(', ')})
        VALUES (${values.map((_, index) => `$${index + 1}`).join(', ')})
        RETURNING *
    `;

  const result = await pool.query(query, values);

  return result.rows[0] as IDriver;
};

export const getDriverByUserId = async (
  user_id: string,
): RepoPromise<IDriver> => {
  const pool = await createPool();
  const query = `SELECT * FROM drivers WHERE user_id = $1`;
  const result = await pool.query(query, [user_id]);
  return result.rows[0] as IDriver;
};

export const getDriverById = async (id: string): RepoPromise<IDriver> => {
  const pool = await createPool();
  const query = `SELECT * FROM drivers WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0] as IDriver;
};

export const updateDriver = async (
  id: string,
  driver: Partial<IDriver>,
): RepoPromise<IDriver> => {
  const pool = await createPool();
  const keys = Object.keys(driver);
  const values = Object.values(driver);

  const query = `UPDATE drivers SET ${keys.join(', ')} = ${values.map((_, index) => `$${index + 1}`).join(', ')} WHERE id = $${keys.length + 1} RETURNING *`;
  const result = await pool.query(query, [...values, id]);
  return result.rows[0] as IDriver;
};

export const deleteDriver = async (id: string): RepoPromise<IDriver> => {
  const pool = await createPool();
  const query = `DELETE FROM drivers WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0] as IDriver;
};
