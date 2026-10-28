import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  email: z.string().email('Invalid email address').max(255).trim().toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  college: z.string().min(2, 'College name is required').max(200).trim(),
  branch: z.string().min(2, 'Branch/Degree is required').max(100).trim(),
  graduationYear: z.number().int().min(2020).max(2035),
  phone: z.string().max(15).optional(),
  referralCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  college: z.string().min(2).max(200).trim().optional(),
  branch: z.string().min(2).max(100).trim().optional(),
  graduationYear: z.number().int().min(2020).max(2035).optional(),
  phone: z.string().max(15).optional(),
});

export const workshopSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  description: z.string().min(10).max(2000).trim(),
  scheduledDate: z.string().datetime().optional(),
  duration: z.number().int().min(15).max(480).optional(),
  status: z.enum(['draft', 'scheduled', 'published', 'completed']).optional(),
  joinLink: z.string().url().optional().or(z.literal('')),
  maxParticipants: z.number().int().min(1).optional(),
});

export const campaignSchema = z.object({
  name: z.string().min(3).max(200).trim(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  targetRegistrations: z.number().int().min(1).default(500),
  totalBudget: z.number().min(0).default(2000),
  status: z.enum(['draft', 'active', 'completed']).optional(),
});

export const channelSchema = z.object({
  channelName: z.string().min(2).max(100).trim(),
  targetRegistrations: z.number().int().min(0).default(0),
  plannedBudget: z.number().min(0).default(0),
  actualSpend: z.number().min(0).default(0),
});

export const ambassadorSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().trim().toLowerCase(),
  college: z.string().min(2).max(200).trim(),
  referralCode: z.string().min(3).max(20).trim().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  assignedCampaign: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
