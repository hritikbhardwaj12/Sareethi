import { z } from 'zod';

export const CategoryEnum = z.enum(['Saree', 'Suit', 'Other']);

export const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Product name required'),
  category: CategoryEnum,
  selling_price: z.number().positive('Price must be greater than 0'),
  cost_price: z.number().optional(),
  stock_quantity: z.number().int().nonnegative().default(0),
  color: z.string().optional(),
  fabric: z.string().optional(),
  style: z.string().optional(),
  pattern: z.string().optional(),
  occasion: z.string().optional(),
  images: z.array(z.string().url()).min(1, 'At least one product image is required'),
});

export const BillSchema = z.object({
  customer_name: z.string().min(2, 'Customer name required'),
  customer_phone: z.string().min(10, 'Valid phone number required'),
  items: z.array(
    z.object({
      product_id: z.string(),
      name: z.string(),
      price: z.number().positive(),
      quantity: z.number().int().positive().default(1),
    })
  ).min(1, 'Bill must contain at least one item'),
});

export type Product = z.infer<typeof ProductSchema>;
export type Bill = z.infer<typeof BillSchema>;
