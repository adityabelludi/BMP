// ------------------------------------------------------------------
// Shared domain types for BMP - Belludi Masala Products
// ------------------------------------------------------------------

export type SizeCode = "100g" | "500g" | "1kg";

export type SpiceLevel = "Mild" | "Medium" | "High";

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export interface ProductVariant {
  size: SizeCode;
  price: number; // in INR
  weight_grams: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  short_description: string;
  image_url: string;
  spice_default: SpiceLevel;
  category: string;
  is_bestseller: boolean;
  in_stock: boolean;
  variants: ProductVariant[];
  created_at?: string;
}

export interface CartItem {
  // A unique line key = product slug + size + spice level
  key: string;
  product_id: string;
  slug: string;
  name: string;
  image_url: string;
  size: SizeCode;
  price: number;
  spice_level: SpiceLevel;
  quantity: number;
}

// Snapshot of a cart item stored inside orders.items (JSONB)
export interface OrderItem {
  product_id: string;
  name: string;
  size: SizeCode;
  spice_level: SpiceLevel;
  price: number;
  quantity: number;
  line_total: number;
}

export interface Order {
  id: string;
  user_id: string | null;
  customer_name: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  notes: string | null;
  items: OrderItem[];
  subtotal: number;
  delivery_charge: number;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
}
