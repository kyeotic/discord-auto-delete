import { z } from 'zod'

export const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export type Player = z.infer<typeof PlayerSchema>
