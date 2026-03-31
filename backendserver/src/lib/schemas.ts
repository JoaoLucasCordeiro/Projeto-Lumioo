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

export const createProjectSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  category: z.string().min(1).max(100),
  image: z.string().optional(),
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'OPEN_FOR_APPLICATIONS']),
  contactEmail: z.string().email('Invalid contact email.').optional(),
  contactPhone: z.string().optional(),
  teamMembers: z
    .array(
      z.object({
        name: z.string().min(1).max(100),
        role: z.string().min(1).max(100),
        photo: z.string().optional().nullable(),
      })
    )
    .min(1, 'At least one team member is required.'),
});

export const createWorkSchema = z.object({
  title: z.string().min(1).max(300),
  workType: z.enum(['TCC', 'ARTICLE', 'THESIS', 'DISSERTATION']),
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
  department: z.string().optional(),
  pdfFile: z.string().min(1, 'PDF file is required.'),
});
