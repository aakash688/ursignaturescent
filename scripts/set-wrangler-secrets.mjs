/**
 * Set Cloudflare Worker secrets from .env.local and .env using wrangler.
 * Run: npm run wrangler:secrets
 *
 * Reads .env.local first, then .env (env.local overrides). Runs `wrangler secret put VAR_NAME`
 * for each secret that has a value. Non-secret vars stay in wrangler.jsonc.
 */

import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const SECRET_KEYS = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'NEXT_PUBLIC_RAZORPAY_KEY_ID',
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'TELEGRAM_BOT_TOKEN',
  'SHIPROCKET_PASSWORD',
  'CRON_SECRET',
]

function loadEnv(path) {
  if (!existsSync(path)) return {}
  const content = readFileSync(path, 'utf8').trim()
  const out = {}
  for (const line of content.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (!m) continue
    const raw = m[2].trim()
    const value = raw.replace(/^["']|["']$/g, '').trim()
    if (value !== '') out[m[1]] = value
  }
  return out
}

const envLocal = loadEnv(join(root, '.env.local'))
const envFile = loadEnv(join(root, '.env'))
const env = { ...envFile, ...envLocal }

let set = 0
for (const key of SECRET_KEYS) {
  const value = env[key] ?? process.env[key]
  if (!value) {
    console.log(`Skip ${key} (empty)`)
    continue
  }
  try {
    execSync(`wrangler secret put ${key}`, {
      input: value,
      stdio: ['pipe', 'inherit', 'inherit'],
      cwd: root,
    })
    set++
  } catch (e) {
    console.error(`Failed to set ${key}:`, e.message)
  }
}

console.log(`\nDone. Set ${set} secret(s).`)
console.log('Non-secret vars are in wrangler.jsonc "vars".')
