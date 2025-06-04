import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import schema from '~/database/schema'

import { handleError, logger } from './response'

export { sql, eq, ne, and, or, gt, lt } from 'drizzle-orm'

let connection: Pool | null = null

function createConnection(): Pool | null {
  let connectionString: string

  try {
    // Attempt to use Nuxt's runtime config if available
    const runtimeConfig = useRuntimeConfig()
    connectionString = runtimeConfig.databaseUrl
  } catch {
    // Fallback to process.env if useRuntimeConfig is not available (e.g., in scripts)
    // eslint-disable-next-line no-console
    console.info('Falling back to environment variables for DB configuration (likely script execution).')
    connectionString = process.env.NUXT_DATABASE_URL || ''

    if (!connectionString) {
      // Use console.error for scripts, as logger might have dependencies
      console.error('Error: Database configuration is missing or incomplete in environment variables.')
      console.error(`DB Config: DATABASE_URL=${!!connectionString}`)
      throw new Error(
        'Database configuration is missing or incomplete for script execution. Ensure NUXT_DATABASE_URL is set in .env.'
      )
    }
  }

  try {
    const pool = new Pool({
      connectionString,
      max: 10,
    })

    // Test the connection
    pool
      .connect()
      .then((client) => {
        client.release()
      })
      .catch((connectionError) => {
        const errorMessage = connectionError instanceof Error ? connectionError.message : 'Unknown error'
        const logFn = typeof logger !== 'undefined' ? logger.error : console.error
        logFn('PostgreSQL Connection Test Failed', {
          code: 'POSTGRESQL_CONNECTION_TEST_FAILED',
          cause: {
            error: {
              message: errorMessage,
              code: connectionError.code,
            },
          },
        })
      })

    return pool
  } catch (error) {
    handleError(error)
    return null
  }
}

export function useDrizzle() {
  if (!connection) {
    connection = createConnection()
  }
  if (!connection) {
    throw new Error('Failed to create PostgreSQL connection')
  }
  return drizzle(connection, { schema })
}
