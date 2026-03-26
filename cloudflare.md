# Cloudflare Workers Migration

Migrating from Deno Deploy Classic to Cloudflare Workers.

## What Needs to Change

| Deno Deploy API | Cloudflare Equivalent | Scope |
|---|---|---|
| `Deno.serve()` | `export default { fetch(req, env, ctx) }` | `server.ts` |
| `Deno.cron()` | `export default { scheduled(event, env, ctx) }` + wrangler cron trigger | `cron.ts` |
| `Deno.openKv()` / `Deno.Kv` | Cloudflare KV namespace binding (`env.CONFIGS_KV`) | `context.ts`, `configStore.ts` |
| `Deno.env.get()` | `env.VAR_NAME` (passed into handler) | `config.ts` |
| `@kitsonk/kv-toolbox` | Cloudflare KV `.list()` API | `configStore.ts` |
| `@kyeotic/server` (lazy, makeSet) | Inline replacements | `context.ts`, `configStore.ts` |
| `deno.land/x/sift` (json helper) | `new Response(JSON.stringify(...))` | `server.ts` |
| `discord.js` REST client | Native `fetch` + `discord-api-types` routes | `context.ts`, commands |
| `deno.json` | `package.json` + `wrangler.toml` | project root |
| `.ts` import extensions | No extensions (Node/bundler convention) | all files |

### KV Key Structure Change

`makeSet` generates array keys like `['CONFIGS', guildId, channelId]`. Cloudflare KV uses string keys:

- `['CONFIGS', guildId, channelId]` → `"CONFIGS:${guildId}:${channelId}"`
- List prefix `['CONFIGS']` → `.list({ prefix: 'CONFIGS:' })`

---

## Phase 1: Cloudflare Project Setup — DONE

- [x] `wrangler` installed as local dev dependency
- [x] `package.json` updated — type module, runtime deps, scripts
- [x] `wrangler.toml` created with KV bindings and hourly cron trigger
- [x] `tsconfig.json` created targeting `@cloudflare/workers-types`
- [x] KV namespace created (prod `94d5f54ab59c488bb0a4d3e8d3f3dca1`, preview `a0a0c46e2f83417d85837c591ee33f10`)
- [x] Secrets set: `BOT_TOKEN`, `DISCORD_PUBLIC_KEY`

---

## Phase 2: Data Migration (Deno KV → Cloudflare KV)

- [x] Write `scripts/export-kv.ts` — dumps all `CONFIGS` entries from Deno KV to JSON
- [x] Transform key format: array keys → colon-delimited string keys
- [x] Bulk import into Cloudflare KV via `wrangler kv bulk put`
- [x] Verify data in CF KV

**To run the migration:**
```sh
# 1. Export from Deno KV
deno task export-kv
# or: deno run -A --unstable-kv scripts/export-kv.ts kv-export.json

# 2. Import into Cloudflare KV (prod namespace)
npx wrangler kv bulk put --binding CONFIGS_KV kv-export.json
# or by namespace ID:
# npx wrangler kv bulk put --namespace-id 94d5f54ab59c488bb0a4d3e8d3f3dca1 kv-export.json

# 3. Verify a sample entry
npx wrangler kv list --binding CONFIGS_KV
```

**Key format for wrangler bulk import:**
```json
[
  {
    "key": "CONFIGS:guildId:channelId",
    "value": "{\"guildId\":\"...\",\"channelId\":\"...\",\"mode\":\"DELETE_EACH_AFTER\",\"duration\":86400000}"
  }
]
```

---

## Phase 3: Code Migration

Files to rewrite, in order:

- [ ] `src/types.ts` — add `WorkerEnv` interface for CF bindings
- [ ] `src/config.ts` — remove `Deno.env.get()`, accept `WorkerEnv` param
- [ ] `src/configStore.ts` — replace `Deno.Kv` with `KVNamespace`, update key format
- [ ] `src/context.ts` — remove `Deno.openKv()` and `lazy()`, accept `WorkerEnv`
- [ ] `src/cron.ts` — remove `Deno.cron()`, export `cleanupCron` for scheduled handler
- [ ] `src/commands/cleaner.ts` — replace `discord.js` REST with native fetch helper
- [ ] `src/worker.ts` (new) — unified entry point with `fetch` + `scheduled` exports

**Discord REST helper pattern:**
```ts
async function discordRequest(method: string, path: string, token: string, body?: unknown) {
  const res = await fetch(`https://discord.com/api/v10${path}`, {
    method,
    headers: {
      Authorization: `Bot ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`Discord API error: ${res.status}`)
  return res.json()
}
```

---

## Phase 4: Local Development

- [ ] `wrangler dev` for local worker testing
- [ ] Use `cloudflared tunnel` or `ngrok` to expose local port for Discord interaction testing
- [ ] Update Discord app interaction URL to tunnel URL temporarily

---

## Phase 5: Deploy & Cutover

- [ ] `npm run deploy` (`wrangler deploy`)
- [ ] Update Discord app interaction endpoint URL to CF Workers URL
- [ ] Verify slash commands work end-to-end
- [ ] Verify cron fires and deletes messages
- [ ] Decommission Deno Deploy app

---

## Key Notes

- **`discord-interactions` / `verifyKey()`** uses `crypto.subtle` — works in CF Workers natively
- **`discord.js` dropped** — only used its REST client and types; replaced with native fetch + `discord-api-types`
- **CF KV eventual consistency** — fine for this use case (configs written infrequently, read hourly)
- **Bundle size** — without `discord.js` should be well under the 1MB free tier limit
- **Discord bulk delete** only works on messages under 14 days old (pre-existing limitation, not a migration concern)
