import 'dotenv/config'
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'

import schema from '~/database/schema'

import { handleError, logger } from './response'

export { sql, eq, ne, and, or, gt, lt } from 'drizzle-orm'

let connection: mysql.Pool | null = null

function createConnection(): mysql.Pool | null {
  let dbHost, dbPortNumber, dbUser, dbName, dbPassword

  try {
    // Attempt to use Nuxt's runtime config if available
    const runtimeConfig = useRuntimeConfig() // This line will throw if not in Nuxt context
    dbHost = runtimeConfig.mysqlHost
    dbPortNumber = Number(runtimeConfig.mysqlPort)
    dbUser = runtimeConfig.mysqlUser
    dbName = runtimeConfig.mysqlDatabase
    // NUXT_MYSQL_PASSWORD is consistently read from process.env in the original code for the pool
    dbPassword = process.env.NUXT_MYSQL_PASSWORD
  } catch {
    // Fallback to process.env if useRuntimeConfig is not available (e.g., in scripts)
    // dotenv/config at the top of the file should have loaded .env
    // eslint-disable-next-line no-console
    console.info('Falling back to environment variables for DB configuration (likely script execution).')
    dbHost = process.env.NUXT_MYSQL_HOST
    dbPortNumber = Number(process.env.NUXT_MYSQL_PORT)
    dbUser = process.env.NUXT_MYSQL_USER
    dbName = process.env.NUXT_MYSQL_DATABASE
    dbPassword = process.env.NUXT_MYSQL_PASSWORD

    if (!dbHost || Number.isNaN(dbPortNumber) || !dbUser || !dbName) {
      // Use console.error for scripts, as logger might have dependencies
      console.error('Error: Database configuration is missing or incomplete in environment variables.')
      console.error(
        `DB Config: HOST=${dbHost}, PORT=${dbPortNumber}, USER=${dbUser}, DB=${dbName}, PW_SET=${!!dbPassword}`
      )
      throw new Error(
        'Database configuration is missing or incomplete for script execution. Ensure NUXT_MYSQL_HOST, NUXT_MYSQL_PORT, NUXT_MYSQL_USER, NUXT_MYSQL_DATABASE are set in .env.'
      )
    }
  }

  try {
    const config: mysql.PoolOptions = {
      host: dbHost,
      port: dbPortNumber,
      user: dbUser,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    }

    if (dbPassword) {
      config.password = dbPassword
    }

    const pool = mysql.createPool(config)

    // Test the connection
    pool.getConnection().catch((connectionError) => {
      const errorMessage = connectionError instanceof Error ? connectionError.message : 'Unknown error'
      const logFn = typeof logger !== 'undefined' ? logger.error : console.error
      logFn('MySQL Connection Test Failed', {
        code: 'MYSQL_CONNECTION_TEST_FAILED',
        cause: {
          host: config.host,
          database: config.database,
          error: {
            message: errorMessage,
            code: connectionError.code,
            errno: connectionError.errno,
            syscall: connectionError.syscall,
            address: connectionError.address,
            port: connectionError.port,
          },
        },
      })
      // Note: This catch doesn't re-throw, so createConnection might return a pool
      // that isn't actually connected if this async check fails.
      // The original error was before this point, related to config loading.
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
    throw new Error('Failed to create MySQL connection')
  }
  return drizzle(connection, { schema, mode: 'default' })
}
