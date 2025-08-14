import { createPool } from '@/database';
import { createFilterQueryAndValues } from '@/modules/customer/customer.helpers';
import {
  GetCustomersFilters,
  ICustomer,
} from '@/modules/customer/customer.types';
import { createSetClause } from '@/utils/create-set-clause';

export const insertCustomer = async (
  customer: ICustomer,
): RepoPromise<ICustomer> => {
  const { company_name, email, billing_info, user_id } = customer;

  const pool = await createPool();

  const query = `
    INSERT INTO customers (user_id, company_name, email, billing_info)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

  const result = await pool.query(query, [
    user_id,
    company_name,
    email,
    billing_info,
  ]);
  return result.rows[0] as ICustomer;
};

export const getCustomerByUserId = async (
  user_id: string,
): RepoPromise<ICustomer> => {
  const pool = await createPool();
  const query = `SELECT * FROM customers WHERE user_id = $1`;
  const result = await pool.query(query, [user_id]);
  return result.rows[0] as ICustomer;
};

export const updateCustomer = async (
  id: string,
  customer: Partial<ICustomer>,
): RepoPromise<ICustomer> => {
  const { keys, values, setClause } = createSetClause(customer);
  const pool = await createPool();
  const query = `UPDATE customers SET ${setClause}, updated_at = now() WHERE id = $${keys.length + 1} RETURNING *`;
  values.push(id);
  const result = await pool.query(query, values);
  return result.rows[0] as ICustomer;
};

export const getCustomerById = async (id: string): RepoPromise<ICustomer> => {
  const pool = await createPool();
  const query = `SELECT * FROM customers WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0] as ICustomer;
};

export const deleteCustomer = async (id: string): RepoPromise<ICustomer> => {
  const pool = await createPool();
  const query = `DELETE FROM customers WHERE id = $1 RETURNING *`;
  const result = await pool.query(query, [id]);
  return result.rows[0] as ICustomer;
};

export const getCustomers = async (
  filters: GetCustomersFilters,
  pageIndex: number,
  pageSize: number,
): RepoPromise<{ items: ICustomer[]; total: number }> => {
  const pool = await createPool();

  const { filterQuery, filterValues } = createFilterQueryAndValues(
    filters,
    pageIndex,
    pageSize,
  );

  const query = `SELECT * FROM customers ${filterQuery}`;
  const result = await pool.query(query, filterValues);

  const countQuery = `SELECT COUNT(*) FROM customers ${filterQuery}`;
  const countResult = await pool.query(countQuery, filterValues);
  const total = +countResult.rows[0]?.count || 0;

  return { items: result.rows as ICustomer[], total };
};
