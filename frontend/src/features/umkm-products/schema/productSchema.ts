import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "name_required"),
  description: z.string().optional(),
  sku: z.string().min(1, "sku_required"),
  unit: z.string().min(1, "unit_required"),
  dimensions: z.string().optional(),
  weight: z.number({ invalid_type_error: "invalid_number" }).min(0).optional(),
  price: z.number({ invalid_type_error: "invalid_number" }).min(0, "price_min_0"),
  min_stock_level: z.number({ invalid_type_error: "invalid_number" }).min(0).optional(),
  is_active: z.boolean().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
