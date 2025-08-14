import { GetCustomerLocationsFilters } from '@/modules/customer-locations/customer-locations.types';

export const createFilterQueryAndValues = (
  filters: GetCustomerLocationsFilters,
  pageIndex: number,
  pageSize: number,
) => {
  let paramIndex = 1;

  const fieldGroups = {
    customerId: 'customer_id',
    label: 'label',
    addressLine1: 'address_line_1',
    addressLine2: 'address_line_2',
    city: 'city',
    state: 'state',
    postalCode: 'postal_code',
    country: 'country',
    latitude: 'latitude',
    longitude: 'longitude',
    type: 'type',
    isPrimary: 'is_primary',
    notes: 'notes',
  };

  const conditions: string[] = [];
  const filterValues: any[] = [];

  for (const [filterKey, dbKey] of Object.entries(fieldGroups)) {
    const val = filters[filterKey as keyof GetCustomerLocationsFilters];
    if (!val) continue;

    if (filterKey === 'customerId' || filterKey === 'isPrimary') {
      conditions.push(`${dbKey} = $${paramIndex++}`);
      filterValues.push(val);
      continue;
    }

    if (filterKey === 'latitude' || filterKey === 'longitude') {
      conditions.push(`${dbKey} = $${paramIndex++}`);
      filterValues.push(+val);
      continue;
    }

    if (filterKey === 'type') {
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
