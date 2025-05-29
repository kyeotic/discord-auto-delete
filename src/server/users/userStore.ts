import { differenceBy } from 'lodash'
import { listAllValues, makeSet } from '../util/kv.ts'
import { Token } from '@kyeotic/server'
import config from '../config.ts'
import { nanoid } from 'nanoid'

const USERS = makeSet('USERS')
const EXT_ID = makeSet('EX_ID') // external identifier
const AUTH0_SOURCE = 'auth0-kyeotek'

export interface User {
  id: string
  displayName?: string
  externalIds?: ExternalId[]
}

export interface ExternalId {
  source: string
  id: string
}

interface ExternalIdRef {
  userId: string
}

export default class UserStore {
  constructor(private readonly kv: Deno.Kv) {}

  // TODO: replace this with a paging function
  async getAll(): Promise<User[]> {
    return await listAllValues(this.kv, USERS())
  }

  async create(user: User): Promise<User> {
    if (!user.id) throw new Error('id is required')
    validateExternals(user)

    const key = USERS(user.id)
    const existing = await this.kv.get(key)

    if (existing?.versionstamp) {
      throw new Error('User already exists')
    }

    const txn = this.kv
      .atomic()
      .check({ key, versionstamp: null })
      .set(key, user)

    user.externalIds?.forEach((e) => {
      txn.set(EXT_ID(e.source, e.id), { userId: user.id } as ExternalIdRef)
    })

    await txn.commit()

    return user
  }

  async initUser(token: Token): Promise<User> {
    if (token.iss !== config.auth.issuer)
      throw new Error('Unsupported external source')

    const externalId = token.sub

    const dbUser = await this.getByExternalIdentifier(AUTH0_SOURCE, externalId)
    if (dbUser) return dbUser

    const newUser: User = {
      id: nanoid(),
      externalIds: [{ source: AUTH0_SOURCE, id: externalId }],
    }

    await this.create(newUser)

    return newUser
  }

  async update(user: User): Promise<User> {
    if (!user.id) throw new Error('id is required')
    validateExternals(user)

    const key = USERS(user.id)
    const existing = await this.kv.get(key)

    if (!existing.value) {
      throw new Error('User not found')
    }

    const txn = await this.kv.atomic().check(existing).set(key, user)

    // create new externals
    differenceBy(
      user.externalIds ?? [],
      (existing.value as User).externalIds ?? [],
    ).forEach((e) => setExternal(txn, e, user))

    // delete old externals
    differenceBy(
      user.externalIds ?? [],
      (existing.value as User).externalIds ?? [],
    ).forEach((e) => deleteExternal(txn, e))

    await txn.commit()

    return user
  }

  async getByExternalIdentifier(
    source: string,
    externalId: string,
  ): Promise<User | null> {
    const dbId = await this.kv.get(EXT_ID(source, externalId))
    if (!dbId.value) return null

    const user = await this.kv.get(USERS((dbId.value as ExternalIdRef).userId))

    return (user.value as User) ?? null
  }
}

function validateExternals(user: User) {
  if ((user.externalIds?.length ?? 0) > 5)
    throw new Error('Max of 5 external ids')
}

function setExternal(
  txn: Deno.AtomicOperation,
  external: ExternalId,
  user: User,
) {
  txn.set(EXT_ID(external.source, external.id), { userId: user.id })
}

function deleteExternal(txn: Deno.AtomicOperation, external: ExternalId) {
  txn.delete(EXT_ID(external.source, external.id))
}
