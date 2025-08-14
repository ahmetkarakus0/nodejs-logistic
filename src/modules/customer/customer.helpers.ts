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
  let filterQuery = ``;
  let conditions: string[] = [];
  let filterValues: any[] = [];
  let paramIndex = 1;

  const normalFieldKeys = {
    companyName: 'company_name',
    email: 'email',
    userId: 'user_id',
  };

  const billingAddressFieldKeys = {
    billingInfoBillingAddressStreet: 'street',
    billingInfoBillingAddressCity: 'city',
    billingInfoBillingAddressPostalCode: 'postal_code',
    billingInfoBillingAddressCountry: 'country',
  };

  const billingInfoFieldKeys = {
    billingInfoTaxId: 'tax_id',
    billingInfoPaymentMethod: 'payment_method',
  };

  const contactsFieldKeys = {
    billingInfoContactsName: 'name',
    billingInfoContactsEmail: 'email',
    billingInfoContactsPhone: 'phone',
  };

  for (const key in normalFieldKeys) {
    if (filters[key as keyof GetCustomersFilters]) {
      conditions.push(
        `${normalFieldKeys[key as keyof typeof normalFieldKeys]} ILIKE $${paramIndex++}`,
      );
      filterValues.push(`%${filters[key as keyof GetCustomersFilters]}%`);
    }
  }

  for (const key in billingAddressFieldKeys) {
    if (filters[key as keyof GetCustomersFilters]) {
      conditions.push(
        `billing_info->'billing_address'->>'${key}' ILIKE $${paramIndex++}`,
      );
      filterValues.push(`%${filters[key as keyof GetCustomersFilters]}%`);
    }
  }

  for (const key in billingInfoFieldKeys) {
    if (filters[key as keyof GetCustomersFilters]) {
      conditions.push(`billing_info->>'${key}' ILIKE $${paramIndex++}`);
      filterValues.push(`%${filters[key as keyof GetCustomersFilters]}%`);
    }
  }

  for (const key in contactsFieldKeys) {
    if (filters[key as keyof GetCustomersFilters]) {
      conditions.push(`
        EXISTS (
          SELECT 1 FROM jsonb_array_elements(billing_info->'contacts') AS c
          WHERE c->>'${key}' ILIKE $${paramIndex++}
        )
      `);
      filterValues.push(`%${filters[key as keyof GetCustomersFilters]}%`);
    }
  }

  if (conditions.length > 0) {
    filterQuery += ` WHERE ` + conditions.join(' AND ');
  }

  filterQuery += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  filterValues.push(pageSize, pageIndex * pageSize);

  return { filterQuery, filterValues };
};
