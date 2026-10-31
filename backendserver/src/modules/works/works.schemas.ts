import { z } from 'zod';
import { BRAZILIAN_UF_CODES, COUNTRY_OPTIONS, WORK_AREA_VALUES } from '../../shared/geo';

const WORK_TYPE = z.enum(['TCC', 'ARTICLE', 'THESIS', 'DISSERTATION']);
const KEYWORDS_MESSAGE = 'You must provide between 3 and 5 keywords.';

export const createWorkSchema = z
  .object({
    title: z.string().min(1).max(300),
    workType: WORK_TYPE,
    visibility: z.enum(['PUBLIC', 'PRIVATE']).optional().default('PUBLIC'),
    coverImage: z.string().optional(),
    summary: z.string().min(1),
    description: z.string().min(1),
    keywords: z.array(z.string()).min(3, KEYWORDS_MESSAGE).max(5, KEYWORDS_MESSAGE),
    references: z.array(z.string()),
    advisor: z.string().min(1).max(200),
    institution: z.string().min(1).max(200),
    campus: z.string().max(200).optional(),
    city: z.string().min(1).max(150),
    state: z.enum(BRAZILIAN_UF_CODES).optional(),
    country: z.enum(COUNTRY_OPTIONS).optional().default('Brasil'),
    area: z.enum(WORK_AREA_VALUES),
    department: z.string().optional(),
    pdfFile: z.string().min(1, 'PDF file is required.'),
  })
  .refine((data) => data.country !== 'Brasil' || !!data.state, {
    message: 'State is required for works in Brazil.',
    path: ['state'],
  });

export const updateWorkSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  workType: WORK_TYPE.optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).optional(),
  coverImage: z.string().optional(),
  summary: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  keywords: z.array(z.string()).min(3, KEYWORDS_MESSAGE).max(5, KEYWORDS_MESSAGE).optional(),
  references: z.array(z.string()).optional(),
  advisor: z.string().min(1).max(200).optional(),
  institution: z.string().min(1).max(200).optional(),
  campus: z.string().max(200).optional(),
  city: z.string().min(1).max(150).optional(),
  state: z.enum(BRAZILIAN_UF_CODES).optional(),
  country: z.enum(COUNTRY_OPTIONS).optional(),
  area: z.enum(WORK_AREA_VALUES).optional(),
  department: z.string().optional(),
  pdfFile: z.string().min(1, 'PDF file is required.').optional(),
});

export const respondWorkAccessRequestSchema = z.object({
  status: z.enum(['APPROVED', 'DENIED', 'REVOKED']),
});

export type CreateWorkInput = z.infer<typeof createWorkSchema>;
export type UpdateWorkInput = z.infer<typeof updateWorkSchema>;
export type RespondAccessInput = z.infer<typeof respondWorkAccessRequestSchema>;
