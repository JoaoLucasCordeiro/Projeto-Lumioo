import { z } from 'zod';

export const createUserSchema = z.object({
  fullName: z.string().min(1).max(100),
  academicEmail: z.string().email('Invalid email format.'),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  institution: z.string().min(1).max(200),
  academicLevel: z.enum(['UNDERGRADUATE', 'MASTER', 'PHD', 'PROFESSOR']),
  dateOfBirth: z.string().refine(d => !isNaN(Date.parse(d)), { message: 'Invalid date format.' }),
});

export const signInSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required.'),
  password: z.string().min(1, 'Password is required.'),
});

export const createPostSchema = z.object({
  caption: z.string().min(1).max(2000),
  image: z.string().optional(),
  location: z.string().max(200).optional(),
  hashtags: z.array(z.string()).optional().default([]),
});

export const createCommentSchema = z.object({
  text: z.string().min(1).max(500),
});

export const BRAZILIAN_UF_CODES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

export const COUNTRY_OPTIONS = [
  'Brasil', 'Portugal', 'Angola', 'Moçambique', 'Cabo Verde', 'Guiné-Bissau',
  'São Tomé e Príncipe', 'Timor-Leste', 'Estados Unidos', 'Canadá', 'México',
  'Argentina', 'Chile', 'Uruguai', 'Paraguai', 'Bolívia', 'Colômbia', 'Peru',
  'Espanha', 'França', 'Alemanha', 'Itália', 'Reino Unido', 'Países Baixos',
  'China', 'Japão', 'Coreia do Sul', 'Índia', 'Austrália',
] as const;

export const WORK_AREA_VALUES = [
  'EXACT_EARTH_SCIENCES',
  'BIOLOGICAL_SCIENCES',
  'ENGINEERING',
  'HEALTH_SCIENCES',
  'AGRICULTURAL_SCIENCES',
  'APPLIED_SOCIAL_SCIENCES',
  'HUMANITIES',
  'LINGUISTICS_LITERATURE_ARTS',
] as const;

export const createWorkSchema = z
  .object({
    title: z.string().min(1).max(300),
    workType: z.enum(['TCC', 'ARTICLE', 'THESIS', 'DISSERTATION']),
    visibility: z.enum(['PUBLIC', 'PRIVATE']).optional().default('PUBLIC'),
    coverImage: z.string().optional(),
    summary: z.string().min(1),
    description: z.string().min(1),
    keywords: z
      .array(z.string())
      .min(3, 'You must provide between 3 and 5 keywords.')
      .max(5, 'You must provide between 3 and 5 keywords.'),
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
  workType: z.enum(['TCC', 'ARTICLE', 'THESIS', 'DISSERTATION']).optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).optional(),
  coverImage: z.string().optional(),
  summary: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  keywords: z
    .array(z.string())
    .min(3, 'You must provide between 3 and 5 keywords.')
    .max(5, 'You must provide between 3 and 5 keywords.')
    .optional(),
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

export const createProjectSchema = z
  .object({
    title: z.string().min(1).max(200),
    description: z.string().min(1),
    category: z.string().min(1).max(100),
    image: z.string().optional(),
    status: z.enum(['IN_PROGRESS', 'COMPLETED', 'OPEN_FOR_APPLICATIONS']),
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
        })
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
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'OPEN_FOR_APPLICATIONS']).optional(),
  contactEmail: z.string().email('Invalid contact email.').optional(),
  contactPhone: z.string().optional(),
  campus: z.string().max(200).optional(),
  city: z.string().min(1).max(150).optional(),
  state: z.enum(BRAZILIAN_UF_CODES).optional(),
  country: z.enum(COUNTRY_OPTIONS).optional(),
});
