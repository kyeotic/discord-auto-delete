# Cloudflare Workers Migration

Migrating from Deno Deploy Classic to Cloudflare Workers.

When finishing work update this document with progress and changes.

## What Needs to Change

| Deno Deploy API                   | Cloudflare Equivalent                                                   | Scope                          |
| --------------------------------- | ----------------------------------------------------------------------- | ------------------------------ |
| `Deno.serve()`                    | `export default { fetch(req, env, ctx) }`                               | `server.ts`                    |
| `Deno.cron()`                     | `export default { scheduled(event, env, ctx) }` + wrangler cron trigger | `cron.ts`                      |
| `Deno.openKv()` / `Deno.Kv`       | Cloudflare KV namespace binding (`env.CONFIGS_KV`)                      | `context.ts`, `configStore.ts` |
| `Deno.env.get()`                  | `env.VAR_NAME` (passed into handler)                                    | `config.ts`                    |
| `@kitsonk/kv-toolbox`             | Cloudflare KV `.list()` API                                             | `configStore.ts`               |
| `@kyeotic/server` (lazy, makeSet) | Inline replacements                                                     | `context.ts`, `configStore.ts` |
| `deno.land/x/sift` (json helper)  | `Response.json(...)`                                                    | `worker.ts`                    |
| `discord.js` REST client          | Native `fetch` + `discord-api-types` routes                             | `context.ts`, commands         |
| `deno.json`                       | `package.json` + `wrangler.toml`                                        | project root                   |
| `.ts` import extensions           | No extensions (Node/bundler convention)                                 | all files                      |

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

## Phase 2: Data Migration (Deno KV → Cloudflare KV) — DONE

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

## Phase 3: Code Migration — DONE

- [x] `src/types.ts` — added `WorkerEnv` interface; replaced `discord.js` types with `discord-api-types/v10`; `SlashCommand.builder` is now `RESTPostAPIChatInputApplicationCommandsJSONBody` (plain JSON, no builder class)
- [x] `src/config.ts` — removed `Deno.env.get()`; exports `getConfig(env: WorkerEnv): AppConfig` function
- [x] `src/configStore.ts` — replaced `Deno.Kv` with `KVNamespace`; keys are now `CONFIGS:guildId:channelId`; `getAll()` uses `.list()` + `.get()` per key
- [x] `src/context.ts` — removed `Deno.openKv()` and `lazy()`; exports `createContext(env)` (sync); `discord` REST replaced with `discordRequest` method using native fetch
- [x] `src/cron.ts` — removed `Deno.cron()`; exports `cleanupCron(app)` called by the scheduled handler
- [x] `src/commands/cleaner.ts` — replaced `discord.js` REST calls with `app.discordRequest()`; replaced `SlashCommandBuilder` with plain JSON object
- [x] `src/commands/mod.ts` — removed `.ts` import extensions
- [x] `src/worker.ts` (new) — unified entry point with `fetch` + `scheduled` exports
- [x] `src/deploy-commands.ts` — replaced `discord.js` REST with native fetch; uses `command.builder` directly (no `.toJSON()`)

---

## Phase 4: Local Development — DONE

- [x] `.denoflare` config created — binds secrets via `${env:...}`, uses preview KV namespace for local dev
- [x] `deno task serve` added to `deno.json`

**To run locally:**
```sh
deno task --env-file=.env serve
```

The `.denoflare` config uses `${env:CF_ACCOUNT_ID}` and `${env:CF_API_TOKEN}` for the Cloudflare profile — add these to `.env` to enable KV reads/writes against the preview namespace during local dev.

To expose the local server for Discord interaction testing, use a tunnel:
```sh
cloudflared tunnel --url http://localhost:8080
# or: ngrok http 8080
```
Then temporarily update the Discord app interaction URL to the tunnel URL.

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
- **`discord.js` dropped** — only used its REST client and types; replaced with native fetch + `discord-api-types`; `SlashCommandBuilder` replaced with plain JSON matching `RESTPostAPIChatInputApplicationCommandsJSONBody`
- **CF KV eventual consistency** — fine for this use case (configs written infrequently, read hourly)
- **Bundle size** — without `discord.js` should be well under the 1MB free tier limit
- **Discord bulk delete** only works on messages under 14 days old (pre-existing limitation, not a migration concern)
- **denoflare vs wrangler** — `.denoflare` is used for local dev (`denoflare serve`); `wrangler.toml` is used for deploy. Both coexist. The preview KV namespace in `.denoflare` is only for local dev; prod namespace comes from `wrangler.toml`.
- **Import map** — `deno.json` import map resolves bare specifiers (e.g. `discord-api-types/v10`) for both Deno tooling and denoflare; no `npm:` prefixes needed in source files
