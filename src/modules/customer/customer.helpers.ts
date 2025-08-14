import {
  GetCustomersFilters,
  ICustomer,
} from '@/modules/customer/customer.types';

export type PublicCustomer = Omit<
  ICustomer,
  'id' | 'user_id' | 'created_at' | 'updated_at'
>;

export const toPublicCustomer = (customer: ICustomer): PublicCustomer => {
  const { id, user_id, created_at, updated_at, ...rest } = customer;
  return rest as PublicCustomer;
};

export const createFilterQueryAndValues = (
  filters: GetCustomersFilters,
  pageIndex: number,
  pageSize: number,
) => {
  let conditions: string[] = [];
  let filterValues: any[] = [];
  let paramIndex = 1;

  const fieldGroups = [
    {
      type: 'normal',
      map: {
        companyName: 'company_name',
        email: 'email',
        userId: 'user_id',
      },
    },
    {
      type: 'billing_address',
      map: {
        billingInfoBillingAddressStreet: 'street',
        billingInfoBillingAddressCity: 'city',
        billingInfoBillingAddressPostalCode: 'postal_code',
        billingInfoBillingAddressCountry: 'country',
      },
    },
    {
      type: 'billing_info',
      map: {
        billingInfoTaxId: 'tax_id',
        billingInfoPaymentMethod: 'payment_method',
      },
    },
    {
      type: 'contacts',
      map: {
        billingInfoContactsName: 'name',
        billingInfoContactsEmail: 'email',
        billingInfoContactsPhone: 'phone',
      },
    },
  ];

  const addCondition = (sql: string, value: any) => {
    conditions.push(sql);
    filterValues.push(value);
  };

  for (const { type, map } of fieldGroups) {
    for (const [filterKey, dbKey] of Object.entries(map)) {
      const val = filters[filterKey as keyof GetCustomersFilters];
      if (!val) continue;

      switch (type) {
        case 'normal':
          if (filterKey === 'userId') {
            addCondition(`${dbKey} = $${paramIndex++}`, val);
          } else {
            addCondition(`${dbKey} ILIKE $${paramIndex++}`, `%${val}%`);
          }
          break;
        case 'billing_address':
          addCondition(
            `billing_info->'billing_address'->>'${dbKey}' ILIKE $${paramIndex++}`,
            `%${val}%`,
          );
          break;
        case 'billing_info':
          addCondition(
            `billing_info->>'${dbKey}' ILIKE $${paramIndex++}`,
            `%${val}%`,
          );
          break;
        case 'contacts':
          addCondition(
            `EXISTS (
              SELECT 1 FROM jsonb_array_elements(billing_info->'contacts') AS c
              WHERE c->>'${dbKey}' ILIKE $${paramIndex++}
            )`,
            `%${val}%`,
          );
          break;
      }
    }
  }

  const filterQuery =
    (conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '') +
    ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;

  filterValues.push(pageSize, pageIndex * pageSize);

  return { filterQuery, filterValues };
};
