import { createPool } from '@/database';
import {
  GetCustomerLocationsFilters,
  ICustomerLocation,
} from '@/modules/customer-locations/customer-locations.types';
import { createSetClause } from '@/utils/create-set-clause';
import { createFilterQueryAndValues } from '@/modules/customer-locations/customer-locations.helpers';

export const getCustomerLocations = async (
  filters: GetCustomerLocationsFilters,
  pageIndex: number,
  pageSize: number,
): RepoPromise<{ items: ICustomerLocation[]; total: number }> => {
  const pool = await createPool();

  const { filterQuery, filterValues } = createFilterQueryAndValues(
    filters,
    pageIndex,
    pageSize,
  );

  const query = `SELECT * FROM customer_locations ${filterQuery}`;
  const result = await pool.query(query, filterValues);

  const countQuery = `SELECT COUNT(*) FROM customer_locations ${filterQuery}`;
  const countResult = await pool.query(countQuery, filterValues);
  const total = +countResult.rows[0]?.count || 0;

  return { items: result.rows as ICustomerLocation[], total };
};

export const insertCustomerLocation = async (
  customerLocation: ICustomerLocation,
): RepoPromise<ICustomerLocation> => {
  const pool = await createPool();

  const query = `INSERT INTO customer_locations (customer_id, label, address_line_1, address_line_2, city, state, postal_code, country, latitude, longitude, type, is_primary, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`;

  const values = [
    customerLocation.customer_id,
    customerLocation.label,
    customerLocation.address_line_1,
    customerLocation.address_line_2,
    customerLocation.city,
    customerLocation.state,
    customerLocation.postal_code,
    customerLocation.country,
    customerLocation.latitude,
    customerLocation.longitude,
    customerLocation.type,
    customerLocation.is_primary,
    customerLocation.notes,
  ];

  const result = await pool.query(query, values);
  return result.rows[0] as ICustomerLocation;
};

export const getCustomerLocationById = async (
  id: string,
): RepoPromise<ICustomerLocation> => {
  const pool = await createPool();
  const query = `SELECT * FROM customer_locations WHERE id = $1`;
  const values = [id];
  const result = await pool.query(query, values);
  return result.rows[0] as ICustomerLocation;
};

export const updateCustomerLocation = async (
  id: string,
  customerLocation: Partial<ICustomerLocation>,
): RepoPromise<ICustomerLocation> => {
  const { keys, values, setClause } = createSetClause(customerLocation);
  const pool = await createPool();
  const query = `UPDATE customer_locations SET ${setClause}, updated_at = now() WHERE id = $${keys.length + 1} RETURNING *`;
  values.push(id);
  const result = await pool.query(query, values);
  return result.rows[0] as ICustomerLocation;
};

export const deleteCustomerLocation = async (
  id: string,
): RepoPromise<ICustomerLocation> => {
  const pool = await createPool();
  const query = `DELETE FROM customer_locations WHERE id = $1 RETURNING *`;
  const values = [id];
  const result = await pool.query(query, values);
  return result.rows[0] as ICustomerLocation;
};
