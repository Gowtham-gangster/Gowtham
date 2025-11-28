export type VendorType = 'apollo' | 'medplus' | 'amazon' | 'blinkit' | 'instamart' | 'netmeds' | 'pharmeasy' | '1mg';

export interface Vendor {
  id: VendorType;
  name: string;
  logo: string;
  description: string;
  deliveryTime: string;
  minOrder: number;
  deliveryFee: number;
  rating: number;
  available: boolean;
  categories: string[];
  website: string;
}

export interface MedicineProduct {
  id: string;
  name: string;
  genericName?: string;
  manufacturer: string;
  strength: string;
  form: string;
  packSize: string;
  price: number;
  mrp: number;
  discount: number;
  inStock: boolean;
  requiresPrescription: boolean;
  vendor: VendorType;
  rxcui?: string;
  imageUrl?: string;
}

export interface CartItem {
  product: MedicineProduct;
  quantity: number;
}

export interface VendorOrder {
  vendor: Vendor;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}
