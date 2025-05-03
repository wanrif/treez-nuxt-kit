import Redis, { type RedisOptions } from 'ioredis'

let redisClient: Redis | null = null
let isConnecting = false // Flag to prevent multiple connection attempts
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 5 // Example: Limit reconnection attempts

const connectRedis = (): void => {
  if (isConnecting || (redisClient && redisClient.status === 'ready')) {
    return // Already connecting or connected
  }

  isConnecting = true
  reconnectAttempts = 0 // Reset attempts on new connection sequence

  const { REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD, REDIS_DB } = useRuntimeConfig()

  const options: RedisOptions = {
    // Use imported RedisOptions type
    port: REDIS_PORT,
    host: REDIS_HOST,
    username: REDIS_USERNAME,
    password: REDIS_PASSWORD,
    db: REDIS_DB,
    lazyConnect: false, // Connect immediately
    showFriendlyErrorStack: process.env.NODE_ENV !== 'production', // More details in dev
    // Reconnection strategy
    retryStrategy: (times: number) => {
      // Add type for times
      if (times > MAX_RECONNECT_ATTEMPTS) {
        logger.log({
          level: 'error',
          code: 'REDIS_MAX_RECONNECT',
          message: `Redis exhausted reconnection attempts (${MAX_RECONNECT_ATTEMPTS}). Giving up.`,
        })
        // Returning null tells ioredis to stop trying
        return null
      }
      reconnectAttempts = times
      const delay = Math.min(times * 100, 2000) // Exponential backoff up to 2 seconds
      logger.log({
        level: 'warn',
        code: 'REDIS_RECONNECTING',
        message: `Redis connection lost. Attempting reconnect ${times}/${MAX_RECONNECT_ATTEMPTS} in ${delay}ms...`,
      })
      return delay
    },
    maxRetriesPerRequest: 3, // Optional: Limit retries for individual commands
  }

  // Clean up previous instance if exists
  if (redisClient) {
    redisClient.removeAllListeners()
    redisClient.disconnect()
  }

  redisClient = new Redis(options)

  redisClient.on('connect', () => {
    logger.log({
      level: 'info',
      code: 'REDIS_CONNECTION',
      message: 'Connected to Redis server successfully.',
    })
    isConnecting = false
    reconnectAttempts = 0 // Reset counter on successful connection
  })

  redisClient.on('ready', () => {
    logger.log({
      level: 'info',
      code: 'REDIS_READY',
      message: 'Redis client is ready to process commands.',
    })
    isConnecting = false // Ensure flag is reset if 'connect' wasn't hit first somehow
  })

  redisClient.on('error', (err) => {
    // Log specific connection errors differently from command errors if needed
    // The retryStrategy handles reconnection attempts for connection errors
    logger.log({
      level: 'error',
      code: 'REDIS_ERROR',
      message: `Redis Client Error: ${err.message}`,
      error: err, // Log the full error object
    })
    // If it's a connection error, retryStrategy will handle it.
    // If it's an auth error or similar fatal error, ioredis might stop retrying.
    if (err.message.includes('AUTH') || err.message.includes('invalid password')) {
      logger.log({
        level: 'error',
        code: 'REDIS_AUTH_ERROR',
        message: 'Redis authentication failed. Please check credentials. Stopping reconnect attempts.',
      })
      // Prevent further automatic reconnections if auth fails
      redisClient?.disconnect()
      redisClient = null // Allow re-initialization if config changes
    }
    isConnecting = false // Reset flag on error
  })

  redisClient.on('close', () => {
    logger.log({
      level: 'warn',
      code: 'REDIS_CLOSE',
      message: `Redis connection closed. Reconnect attempts: ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}.`,
    })
    // Connection closed, retryStrategy will take over if applicable
    isConnecting = false
  })

  redisClient.on('reconnecting', () => {
    // This event fires just before retryStrategy is called
    logger.log({
      level: 'info',
      code: 'REDIS_RECONNECT_EVENT',
      message: `Redis attempting to reconnect (Attempt ${reconnectAttempts + 1})...`,
    })
    isConnecting = true
  })

  redisClient.on('end', () => {
    logger.log({
      level: 'warn',
      code: 'REDIS_END',
      message: 'Redis connection ended. No more reconnection attempts will be made by this client instance.',
    })
    isConnecting = false
    redisClient = null // Set to null so getRedisClient can create a new instance if called again
  })
}

const getRedisClient = (): Redis => {
  // If client doesn't exist or is in a permanently closed state ('end'), try to connect.
  if (!redisClient || redisClient.status === 'end') {
    logger.log({
      level: 'info',
      code: 'REDIS_INIT',
      message: 'Initializing Redis connection...',
    })
    connectRedis()
  }

  // It's possible connectRedis() failed immediately (e.g., bad config)
  // or the client is in the process of connecting/reconnecting.
  // Throwing an error might be too aggressive here, depends on desired behavior.
  // Returning the potentially disconnected client allows commands to queue or fail.
  if (!redisClient) {
    // This case should ideally not be reached if connectRedis() sets up listeners correctly
    // but acts as a safeguard.
    throw new Error('Failed to initialize Redis client.')
  }

  return redisClient
}

// Export a getter function instead of the raw client instance
// This ensures connectRedis() is called on first access if needed.
export const useRedis = (): Redis => getRedisClient()

// Optional: Keep the direct export for existing code compatibility,
// but using useRedis() is recommended.
export const redis = getRedisClient()
