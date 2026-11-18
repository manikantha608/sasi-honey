import { z } from 'zod';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createCategorySchema = z.object({
  name:        z.string().min(2).max(100),
  slug:        z.string().min(2).max(120).regex(slugRegex, 'Slug must be lowercase letters, numbers and hyphens only').optional(),
  description: z.string().max(500).optional(),
  sortOrder:   z.number().int().min(0).optional(),
});

export const updateCategorySchema = z.object({
  name:        z.string().min(2).max(100).optional(),
  slug:        z.string().min(2).max(120).regex(slugRegex, 'Invalid slug format').optional(),
  description: z.string().max(500).nullable().optional(),
  isActive:    z.boolean().optional(),
  sortOrder:   z.number().int().min(0).optional(),
});
