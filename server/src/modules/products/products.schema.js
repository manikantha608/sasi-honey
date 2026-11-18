import { z } from 'zod';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createProductSchema = z.object({
  categoryId:   z.string().uuid(),
  name:         z.string().min(2).max(200),
  slug:         z.string().min(2).max(220).regex(slugRegex).optional(),
  description:  z.string().max(5000).optional(),
  shortDesc:    z.string().max(300).optional(),
  isFeatured:   z.boolean().optional(),
  isBestseller: z.boolean().optional(),
  metaTitle:    z.string().max(200).optional(),
  metaDesc:     z.string().max(500).optional(),
});

export const updateProductSchema = z.object({
  categoryId:   z.string().uuid().optional(),
  name:         z.string().min(2).max(200).optional(),
  slug:         z.string().min(2).max(220).regex(slugRegex).optional(),
  description:  z.string().max(5000).nullable().optional(),
  shortDesc:    z.string().max(300).nullable().optional(),
  isFeatured:   z.boolean().optional(),
  isBestseller: z.boolean().optional(),
  isActive:     z.boolean().optional(),
  metaTitle:    z.string().max(200).nullable().optional(),
  metaDesc:     z.string().max(500).nullable().optional(),
});

export const addVariantSchema = z.object({
  weightGrams:        z.number().int().positive(),
  label:              z.string().min(1).max(50),
  price:              z.number().positive(),
  mrp:                z.number().positive(),
  sku:                z.string().min(2).max(100),
  stockQty:           z.number().int().min(0).optional(),
  lowStockThreshold:  z.number().int().min(0).optional(),
  sortOrder:          z.number().int().min(0).optional(),
});

export const updateVariantSchema = z.object({
  weightGrams:        z.number().int().positive().optional(),
  label:              z.string().min(1).max(50).optional(),
  price:              z.number().positive().optional(),
  mrp:                z.number().positive().optional(),
  sku:                z.string().min(2).max(100).optional(),
  stockQty:           z.number().int().min(0).optional(),
  lowStockThreshold:  z.number().int().min(0).optional(),
  isActive:           z.boolean().optional(),
  sortOrder:          z.number().int().min(0).optional(),
});

// Used with validate(schema, 'query')
export const listProductsSchema = z.object({
  page:        z.string().regex(/^\d+$/).optional(),
  limit:       z.string().regex(/^\d+$/).optional(),
  category:    z.string().optional(),
  search:      z.string().max(100).optional(),
  sort:        z.enum(['newest', 'price_asc', 'price_desc', 'name_asc']).optional(),
  featured:    z.enum(['true', 'false']).optional(),
  bestseller:  z.enum(['true', 'false']).optional(),
});
