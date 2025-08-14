export enum ECustomerLocationType {
  BILLING = 'billing',
  SHIPPING = 'shipping',
  WAREHOUSE = 'warehouse',
  PICKUP = 'pickup',
  BRANCH = 'branch',
  FACTORY = 'factory',
  PORT = 'port',
  CUSTOMS = 'customs',
  HUB = 'hub',
  TRANSIT = 'transit',
  OTHER = 'other',
}

export interface ICustomerLocation {
  id: string;
  customer_id: string;
  label: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string | null;
  postal_code: string;
  country: string;
  latitude: number;
  longitude: number;
  type: ECustomerLocationType;
  is_primary: boolean;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface GetCustomerLocationsFilters {
  customerId?: string;
  label?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  type?: ECustomerLocationType;
  isPrimary?: boolean;
  notes?: string;
}
