import type { SizeCode, SpiceLevel, OrderStatus } from "@/types";

export const BRAND = {
  name: "BMP",
  fullName: "Belludi Masala Products",
  tagline: "Pure. Traditional. Karnataka's Finest Masalas",
  email: "adityabelludi@gmail.com",
  phone: "+91 78991 15841",
  phoneAlt: "+91 76763 23132",
  location: "Davangere, Karnataka, India",
} as const;

// Fallback delivery charges (used if store settings can't be read).
// Admins can customise these in Admin → Settings.
export const DELIVERY_CHARGE = 200; // within India, flat
export const DELIVERY_CHARGE_OUTSIDE = 1500; // outside India, flat

export const SIZE_PRICING: Record<SizeCode, number> = {
  "100g": 40,
  "500g": 200,
  "1kg": 400,
};

export const SIZE_WEIGHTS: Record<SizeCode, number> = {
  "100g": 100,
  "500g": 500,
  "1kg": 1000,
};

export const SIZES: SizeCode[] = ["100g", "500g", "1kg"];

export const SPICE_LEVELS: SpiceLevel[] = ["Mild", "Medium", "High"];

export const ORDER_STATUSES: OrderStatus[] = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export const STATUS_STYLES: Record<OrderStatus, string> = {
  Pending: "bg-amber-100 text-amber-800 border-amber-200",
  Processing: "bg-blue-100 text-blue-800 border-blue-200",
  Shipped: "bg-violet-100 text-violet-800 border-violet-200",
  Delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Cancelled: "bg-rose-100 text-rose-800 border-rose-200",
};
