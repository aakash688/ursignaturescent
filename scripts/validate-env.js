#!/usr/bin/env node
/**
 * Validates .env.local for required URsignature variables.
 * Run: node scripts/validate-env.js
 */
const fs = require('fs')
const path = require('path')

const envPath = path.join(process.cwd(), '.env.local')
const env = path.join(process.cwd(), '.env')

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {}
  const content = fs.readFileSync(filePath, 'utf8')
  const vars = {}
  content.split('\n').forEach((line) => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const eq = trimmed.indexOf('=')
      if (eq > 0) {
        const key = trimmed.slice(0, eq).trim()
        const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
        vars[key] = value
      }
    }
  })
  return vars
}

const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
]

const requiredForFeatures = {
  'SUPABASE_SERVICE_ROLE_KEY': 'Admin operations, cron jobs',
  'RAZORPAY_KEY_ID': 'Payments',
  'RAZORPAY_KEY_SECRET': 'Payments',
  'R2_ACCOUNT_ID': 'Image uploads',
  'R2_ACCESS_KEY_ID': 'Image uploads',
  'R2_SECRET_ACCESS_KEY': 'Image uploads',
}

const vars = { ...loadEnv(env), ...loadEnv(envPath) }

let hasError = false

console.log('\n🔍 URsignature Environment Validation\n')

for (const key of required) {
  const val = vars[key]
  if (!val || val === 'your_anon_key' || val === 'your-project.supabase.co') {
    console.log(`❌ ${key}: MISSING or placeholder`)
    hasError = true
  } else {
    console.log(`✅ ${key}: set`)
  }
}

console.log('\nOptional (for full features):')
for (const [key, desc] of Object.entries(requiredForFeatures)) {
  const val = vars[key]
  if (!val || val.startsWith('your_')) {
    console.log(`⚠️  ${key}: not set (${desc})`)
  } else {
    console.log(`✅ ${key}: set`)
  }
}

if (hasError) {
  console.log('\n❌ Fix required variables in .env.local and retry.')
  process.exit(1)
}

console.log('\n✅ Required env vars OK. Optional features may need more keys.\n')
process.exit(0)
