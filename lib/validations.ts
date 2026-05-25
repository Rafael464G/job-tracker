import { z } from 'zod'

export const applicationSchema = z.object({
  company: z.string().min(1, 'Empresa requerida').max(100),
  position: z.string().min(1, 'Puesto requerido').max(150),
  applied_at: z.string().min(1, 'Fecha requerida'),
  status: z.enum(['applied', 'interview', 'rejected', 'offer']),
  url: z.string().url('URL inválida').or(z.literal('')).optional(),
  notes: z.string().max(1000).optional(),
  follow_up_at: z.string().optional(),
  salary: z.string().max(100).optional(),
})

export type ApplicationInput = z.infer<typeof applicationSchema>
