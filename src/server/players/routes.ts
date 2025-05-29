import { router, authProcedure } from '../trpc.ts'
import { PlayerSchema } from './types.ts'

export const playerRouter = router({
  getAll: authProcedure.query(async ({ ctx: { user, stores } }) => {
    return await stores.players.getForUser(user.id)
  }),
  create: authProcedure
    .input(PlayerSchema)
    .mutation(async ({ input, ctx: { user, stores } }) => {
      return await stores.players.create(user.id, input)
    }),
})
