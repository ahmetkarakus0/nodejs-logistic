export interface ICustomer {
  id: string;
  user_id: string;
  company_name: string;
  email: string;
  billing_info: IBillingInfo;
  created_at: Date;
  updated_at: Date;
}

export interface IBillingInfo {
  billing_address: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  tax_id: string;
  payment_method: string;
  contacts: IContact[];
}

export interface IContact {
  name: string;
  email: string;
  phone: string;
}

export type GetCustomersFilters = {
  companyName?: string;
  email?: string;
  userId?: string;
  billingInfoBillingAddressStreet?: string;
  billingInfoBillingAddressCity?: string;
  billingInfoBillingAddressPostalCode?: string;
  billingInfoBillingAddressCountry?: string;
  billingInfoTaxId?: string;
  billingInfoPaymentMethod?: string;
  billingInfoContactsName?: string;
  billingInfoContactsEmail?: string;
  billingInfoContactsPhone?: string;
};
