import { GetDriversFilters } from './drivers.types';

export const createFilterQueryAndValues = (
  filters: GetDriversFilters,
  pageIndex: number,
  pageSize: number,
) => {
  let paramIndex = 1;

  const fieldGroups = {
    userId: 'user_id',
    licenseNumber: 'license_number',
    licenseExpiryDate: 'license_expiry_date',
    dateOfBirth: 'date_of_birth',
    address: 'address',
    emergencyContactName: 'emergency_contact_name',
    emergencyContactPhone: 'emergency_contact_phone',
    employmentStartDate: 'employment_start_date',
    employmentEndDate: 'employment_end_date',
    status: 'status',
    notes: 'notes',
  };

  const conditions: string[] = [];
  const filterValues: any[] = [];

  for (const [filterKey, dbKey] of Object.entries(fieldGroups)) {
    const val = filters[filterKey as keyof GetDriversFilters];
    if (!val) continue;

    if (filterKey === 'userId') {
      conditions.push(`${dbKey} = $${paramIndex++}`);
      filterValues.push(val);
      continue;
    }

    if (filterKey === 'status') {
      conditions.push(`${dbKey}::text ILIKE $${paramIndex++}`);
      filterValues.push(val);
      continue;
    }

    conditions.push(`${dbKey} ILIKE $${paramIndex++}`);
    filterValues.push(`%${val}%`);
  }

  const filterQuery =
    (conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '') +
    ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;

  filterValues.push(pageSize, pageIndex * pageSize);

  return { filterQuery, filterValues };
};
