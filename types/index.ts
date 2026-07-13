// ------------------------------------------------------------------
// Shared domain types for BMP - Belludi Masala Products
// ------------------------------------------------------------------

// A size is now a free-form label per product (e.g. "100g", "250g", "Family pack 2kg").
export type SizeCode = string;

export type SpiceLevel = "Mild" | "Medium" | "High";

export interface Category {
  id: string;
  name: string;
  created_at?: string;
}

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export interface ProductVariant {
  size: SizeCode; // label, e.g. "250g" or "Family pack 2kg"
  price: number; // in INR
  weight_grams?: number; // optional, for reference only
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
  email: string | null;
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
