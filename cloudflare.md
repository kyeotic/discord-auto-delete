# Cloudflare Workers Migration

Migrating from Deno Deploy Classic to Cloudflare Workers.

When finishing work update this document with progress and changes.

## What Needs to Change

| Deno Deploy API                   | Cloudflare Equivalent                                                        | Scope                          |
| --------------------------------- | ---------------------------------------------------------------------------- | ------------------------------ |
| `Deno.serve()`                    | `export default { fetch(req, env, ctx) }`                                    | `server.ts`                    |
| `Deno.cron()`                     | `export default { scheduled(event, env, ctx) }` + `wrangler.toml` cron trigger | `cron.ts`                   |
| `Deno.openKv()` / `Deno.Kv`       | Cloudflare KV namespace binding (`env.CONFIGS_KV`)                           | `context.ts`, `configStore.ts` |
| `Deno.env.get()`                  | `env.VAR_NAME` (passed into handler)                                         | `config.ts`                    |
| `@kitsonk/kv-toolbox`             | Cloudflare KV `.list()` API                                                  | `configStore.ts`               |
| `@kyeotic/server` (lazy, makeSet) | Inline replacements                                                          | `context.ts`, `configStore.ts` |
| `deno.land/x/sift` (json helper)  | `Response.json(...)`                                                         | `worker.ts`                    |
| `discord.js` REST client          | Native `fetch` + `discord-api-types` routes                                  | `context.ts`, commands         |
| `deno.json` tasks                 | `wrangler.toml` + updated `deno.json` tasks using `npx wrangler`             | project root                   |
| `.ts` import extensions           | No extensions (Node/bundler convention)                                      | all files                      |

### KV Key Structure Change

`makeSet` generates array keys like `['CONFIGS', guildId, channelId]`. Cloudflare KV uses string keys:

- `['CONFIGS', guildId, channelId]` → `"CONFIGS:${guildId}:${channelId}"`
- List prefix `['CONFIGS']` → `.list({ prefix: 'CONFIGS:' })`

---

## Phase 1: Cloudflare Project Setup — DONE

- [x] `wrangler.toml` created with KV bindings, cron trigger, and compatibility settings
- [x] `deno.json` updated — tasks for dev, deploy, push-secrets, and KV migration
- [x] KV namespace created (prod `94d5f54ab59c488bb0a4d3e8d3f3dca1`, preview `a0a0c46e2f83417d85837c591ee33f10`)
- [x] Secrets set via `deno task push-secrets`: `BOT_TOKEN`, `DISCORD_PUBLIC_KEY`

**`wrangler.toml` key sections:**
```toml
[[kv_namespaces]]
binding = "CONFIGS_KV"
id = "<prod-namespace-id>"
preview_id = "<preview-namespace-id>"

[triggers]
crons = ["0 * * * *"]
```

**`deno.json` tasks:**
```json
{
  "dev": "npx wrangler dev --remote --var BOT_TOKEN:$BOT_TOKEN --var DISCORD_PUBLIC_KEY:$DISCORD_PUBLIC_KEY",
  "deploy": "npx wrangler deploy",
  "push-secrets": "echo $BOT_TOKEN | npx wrangler secret put BOT_TOKEN && echo $DISCORD_PUBLIC_KEY | npx wrangler secret put DISCORD_PUBLIC_KEY"
}
```

Secrets are managed via env vars (direnv + `.env`). `push-secrets` uploads them to Cloudflare; run it once on setup and whenever secrets change. Local dev uses `--var` flags to inject secrets directly from env, and `--remote` to use the preview KV namespace.

**Note:** wrangler reads `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` from the environment (not `CF_ACCOUNT_ID` / `CF_API_TOKEN`). Add both to `.env`.

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

# 2. Import into Cloudflare KV (prod namespace)
deno task import-kv

# 3. Verify a sample entry
npx wrangler kv list --binding CONFIGS_KV --remote
```

**Key format for bulk import (`deno task import-kv`):**
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

- [x] `deno task dev` runs `wrangler dev --remote` — uses preview KV namespace, injects secrets from env vars
- [x] Cron can be tested locally while `dev` is running:

```sh
curl "http://localhost:8787/__scheduled?cron=0+*+*+*+*"
```

**To run locally:**
```sh
deno task dev
```

Requires `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `BOT_TOKEN`, and `DISCORD_PUBLIC_KEY` in `.env` (loaded via direnv).

To expose the local server for Discord interaction testing, use a tunnel:
```sh
cloudflared tunnel --url http://localhost:8787
# or: ngrok http 8787
```
Then temporarily update the Discord app interaction URL to the tunnel URL.

---

## Phase 5: Deploy & Cutover — DONE

- [x] `deno task push-secrets` — upload secrets to Cloudflare
- [x] `deno task deploy` — deploys worker and registers cron trigger via `wrangler.toml`
- [x] Update Discord app interaction endpoint URL to CF Workers URL
- [x] Verify slash commands work end-to-end
- [ ] Verify cron fires and deletes messages
- [ ] Decommission Deno Deploy app

---

## Key Notes

- **`discord-interactions` / `verifyKey()`** uses `crypto.subtle` — works in CF Workers natively
- **`discord.js` dropped** — only used its REST client and types; replaced with native fetch + `discord-api-types`; `SlashCommandBuilder` replaced with plain JSON matching `RESTPostAPIChatInputApplicationCommandsJSONBody`
- **CF KV eventual consistency** — fine for this use case (configs written infrequently, read hourly)
- **Bundle size** — without `discord.js` should be well under the 1MB free tier limit
- **Discord bulk delete** only works on messages under 14 days old (pre-existing limitation, not a migration concern)
- **wrangler** — used for all deploy and local dev. Cron triggers are registered automatically on `wrangler deploy` via `[triggers]` in `wrangler.toml`. denoflare does not support cron trigger registration.
- **Secrets vs vars** — `wrangler secret put` stores encrypted secrets in Cloudflare for production. For local dev, `wrangler dev --var KEY:$VALUE` injects them from env without a `.dev.vars` file.
- **Import map** — `deno.json` import map resolves bare specifiers (e.g. `discord-api-types/v10`) for Deno tooling; wrangler bundles via esbuild and resolves `npm:` specifiers from the import map automatically
