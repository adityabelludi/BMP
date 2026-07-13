import { z } from "zod";
import { SPICE_LEVELS } from "@/lib/constants";

export const checkoutSchema = z.object({
  customer_name: z
    .string()
    .min(2, "Please enter your full name")
    .max(80, "Name is too long"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  address_line: z
    .string()
    .min(6, "Please enter your full address")
    .max(300, "Address is too long"),
  city: z.string().min(2, "Enter your city"),
  state: z.string().min(2, "Enter your state"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  notes: z.string().max(500, "Notes are too long").optional().or(z.literal("")),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const orderItemSchema = z.object({
  product_id: z.string(),
  name: z.string(),
  size: z.string().min(1),
  spice_level: z.enum(SPICE_LEVELS as [string, ...string[]]),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  line_total: z.number().nonnegative(),
});

export const createOrderSchema = checkoutSchema.extend({
  items: z.array(orderItemSchema).min(1, "Your cart is empty"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

// ---------- Product management ----------
export const productVariantSchema = z.object({
  size: z.string().min(1, "Size label is required").max(40),
  price: z.coerce.number().int().positive("Price must be greater than 0"),
  weight_grams: z.coerce.number().int().nonnegative().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2, "Name is required").max(80),
  slug: z
    .string()
    .min(2, "Slug is required")
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only"),
  short_description: z
    .string()
    .min(2, "Add a short description")
    .max(160, "Keep the short description under 160 characters"),
  description: z.string().min(2, "Add a description").max(2000),
  image_url: z.string().min(1, "Add a product image"),
  category: z.string().min(2, "Category is required").max(60),
  spice_default: z.enum(SPICE_LEVELS as [string, ...string[]]),
  is_bestseller: z.boolean(),
  in_stock: z.boolean(),
  variants: z.array(productVariantSchema).min(1, "At least one size is required"),
});

export type ProductInput = z.infer<typeof productSchema>;
