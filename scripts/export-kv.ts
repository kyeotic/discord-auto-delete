/**
 * Export all CONFIGS entries from Deno KV to a JSON file
 * suitable for `wrangler kv bulk put`.
 *
 * Usage:
 *   deno run -A --unstable-kv scripts/export-kv.ts [output.json]
 *
 * Output format (for wrangler kv bulk put):
 *   [{ "key": "CONFIGS:guildId:channelId", "value": "{...}" }]
 */

const outputPath = Deno.args[0] ?? 'kv-export.json'

const kvUrl = Deno.env.get('KV_TARGET_URL')
if (!kvUrl) {
  console.error('KV_TARGET_URL env var is required')
  Deno.exit(1)
}

const kv = await Deno.openKv(kvUrl)

const entries: { key: string; value: string }[] = []

for await (const entry of kv.list({ prefix: ['CONFIGS'] })) {
  const keyParts = entry.key as string[]
  // Array key ['CONFIGS', guildId, channelId] → 'CONFIGS:guildId:channelId'
  const cfKey = keyParts.join(':')
  entries.push({
    key: cfKey,
    value: JSON.stringify(entry.value),
  })
}

kv.close()

await Deno.writeTextFile(outputPath, JSON.stringify(entries, null, 2))

console.log(`Exported ${entries.length} entries to ${outputPath}`)
