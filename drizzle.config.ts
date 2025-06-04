import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './database/migrations',
  schema: './database/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.NUXT_DATABASE_URL || 'postgresql://postgres@localhost:5432/treez_nuxtkit?schema=public',
  },
})
