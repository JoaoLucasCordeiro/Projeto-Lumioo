import { z } from 'zod';
import { BRAZILIAN_UF_CODES, COUNTRY_OPTIONS } from '../../shared/geo';

const STATUS = z.enum(['IN_PROGRESS', 'COMPLETED', 'OPEN_FOR_APPLICATIONS']);

export const createProjectSchema = z
  .object({
    title: z.string().min(1).max(200),
    description: z.string().min(1),
    category: z.string().min(1).max(100),
    image: z.string().optional(),
    status: STATUS,
    contactEmail: z.string().email('Invalid contact email.').optional(),
    contactPhone: z.string().optional(),
    campus: z.string().max(200).optional(),
    city: z.string().min(1).max(150),
    state: z.enum(BRAZILIAN_UF_CODES).optional(),
    country: z.enum(COUNTRY_OPTIONS).optional().default('Brasil'),
    teamMembers: z
      .array(
        z.object({
          name: z.string().min(1).max(100),
          role: z.string().min(1).max(100),
          photo: z.string().optional().nullable(),
        }),
      )
      .min(1, 'At least one team member is required.'),
  })
  .refine((data) => data.country !== 'Brasil' || !!data.state, {
    message: 'State is required for projects in Brazil.',
    path: ['state'],
  });

export const updateProjectSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  category: z.string().min(1).max(100).optional(),
  image: z.string().optional(),
  status: STATUS.optional(),
  contactEmail: z.string().email('Invalid contact email.').optional(),
  contactPhone: z.string().optional(),
  campus: z.string().max(200).optional(),
  city: z.string().min(1).max(150).optional(),
  state: z.enum(BRAZILIAN_UF_CODES).optional(),
  country: z.enum(COUNTRY_OPTIONS).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
