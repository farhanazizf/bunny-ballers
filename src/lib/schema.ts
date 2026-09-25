import { z } from 'zod'

export const trialSchema = z.object({
  childName: z.string().trim().min(2),
  age: z.number().int().min(6).max(18),
  gender: z.enum(['PA', 'PI']),
  parentName: z.string().trim().min(2),
  whatsapp: z.string().trim().regex(/^(\+62|62|0)8[1-9][0-9]{6,11}$/),
  session: z.enum(['fri', 'sat']),
  experience: z.enum(['none', 'lt1', '1to3', 'gt3']),
  notes: z.string().optional(),
  programId: z.string().optional(),
  consent: z.literal(true),
})

export type TrialForm = z.infer<typeof trialSchema>
