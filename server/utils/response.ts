import chalk from 'chalk'
import * as winston from 'winston'

import { TRPCError } from '@trpc/server'

import { generateTransactionId } from '~/utils/commonHelper'

const format = winston.format

/**
 * Custom log format for Winston logger
 *
 * @example
 * logger.info('Info message', {
 *   level: 'info',
 *   message: 'This is a log message',
 *   transactionId: 'some-transaction-id',
 *   label: 'MyLabel',
 *   code: 'INFO_CODE',
 *   statusCode: 200,
 *   cause: null,
 *   timestamp: new Date().toISOString(),
 *   zodErrors: null
 * })
 * * Returns: '2023-10-01 12:00:00 [MyLabel] some-transaction-id INFO_CODE (200) This is a log message Cause: null Zod errors: null'
 *
 * @param {Object} options - Log options
 * @param {string} options.level - Log level (info, warn, error)
 * @param {string} options.message - Log message
 * @param {string} options.transactionId - Transaction ID
 * @param {string} options.label - Log label
 * @param {string} options.code - Log code
 * @param {number} options.statusCode - HTTP status code
 * @param {string} options.cause - Error cause
 * @param {string} options.timestamp - Log timestamp
 * @param {string} options.zodErrors - Zod validation errors
 * @returns {string} Formatted log message
 */
const myFormat = format.printf(
  ({ level, message, transactionId, label, code, statusCode, cause, timestamp, zodErrors }) => {
    const levelColors: Record<string, chalk.Chalk> = {
      error: chalk.red,
      warn: chalk.yellow,
      info: chalk.blueBright,
    }
    const coloredLevel = (levelColors[level] || chalk.white)(level.toUpperCase())
    return `${chalk.gray(timestamp)} [${chalk.magentaBright(label)}] ${transactionId ?? generateTransactionId()} ${coloredLevel}: ${code ? `(${chalk.cyan(code)})` : ''} ${statusCode ? `(${chalk.green(statusCode)})` : ''} ${message} ${cause ? `Cause: ${chalk.red(JSON.stringify(cause))}` : ''} ${zodErrors ? `Zod errors: ${chalk.red(JSON.stringify(zodErrors))}` : ''}`
  }
)

export const logger = winston.createLogger({
  format: format.combine(
    format.label({ label: 'Nuxtreez log' }),
    format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
    myFormat
  ),
  transports: [new winston.transports.Console()],
})

interface SuccessResponse<T = unknown> {
  status: 'success'
  statusCode: number
  message: string
  data?: T
  transactionId: string
}

export function createSuccessResponse<T>(
  message: string,
  data?: T,
  statusCode: number = 200,
  transactionId?: string
): SuccessResponse<T> {
  logger.info(message, { data, transactionId, code: 'SUCCESS', statusCode })
  return {
    status: 'success',
    statusCode,
    message,
    ...(data && { data }),
    transactionId: transactionId ?? generateTransactionId(),
  }
}

class BaseError extends TRPCError {
  constructor(code: TRPCError['code'], message: string, cause?: unknown) {
    super({ code, message, cause })
  }
}

export class ValidationError extends BaseError {
  constructor(message: string, errors?: Record<string, string[]>) {
    super('BAD_REQUEST', message, errors)
  }
}

export class AuthError extends BaseError {
  constructor(message: string) {
    super('UNAUTHORIZED', message)
  }
}

export class ForbiddenError extends BaseError {
  constructor(message: string = 'You do not have permission to perform this action') {
    super('FORBIDDEN', message)
  }
}

export class NotFoundError extends BaseError {
  constructor(message: string) {
    super('NOT_FOUND', message)
  }
}

export class BusinessError extends BaseError {
  constructor(message: string) {
    super('BAD_REQUEST', message)
  }
}

export function handleError(error: unknown, ctx?: { transactionId: string }) {
  const logAndThrow = (level: 'error' | 'warn', logMessage: string, logDetails: object, throwError: TRPCError) => {
    logger[level](logMessage, logDetails)
    throw throwError
  }

  if (error instanceof Error && 'code' in error && typeof error.code === 'string') {
    const mysqlError = error as Error & { code: string; errno?: number }
    if (mysqlError.code === 'ECONNREFUSED') {
      logAndThrow(
        'error',
        'MySQL Connection Error',
        {
          code: 'MYSQL_CONNECTION_REFUSED',
          statusCode: 500,
          cause: {
            error: mysqlError.message,
            errno: mysqlError.errno,
            details: 'Database connection refused. Please check if MySQL is running and credentials are correct.',
          },
          transactionId: ctx?.transactionId,
        },
        new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred. Please try again later.',
        })
      )
    }
  }

  if (error instanceof ValidationError) {
    logAndThrow(
      'warn',
      'Validation error:',
      {
        message: error.message,
        cause: error.cause,
        code: error.code,
        statusCode: 400,
        transactionId: ctx?.transactionId,
      },
      new TRPCError({
        code: 'BAD_REQUEST',
        message: error.message,
        cause: {
          status: 'error',
          statusCode: 400,
          message: error.message,
          errors: error.cause as unknown as Record<string, string[]>,
        },
      })
    )
  }

  if (error instanceof TRPCError) {
    const statusCodeMap: Record<TRPCError['code'], number> = {
      PARSE_ERROR: 400,
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      METHOD_NOT_SUPPORTED: 405,
      TIMEOUT: 408,
      CONFLICT: 409,
      PRECONDITION_FAILED: 412,
      PAYLOAD_TOO_LARGE: 413,
      UNPROCESSABLE_CONTENT: 422,
      TOO_MANY_REQUESTS: 429,
      CLIENT_CLOSED_REQUEST: 499,
      INTERNAL_SERVER_ERROR: 500,
      NOT_IMPLEMENTED: 501,
      BAD_GATEWAY: 502,
      SERVICE_UNAVAILABLE: 503,
      GATEWAY_TIMEOUT: 504,
      UNSUPPORTED_MEDIA_TYPE: 415,
    }

    const statusCode = statusCodeMap[error.code] || 500

    logAndThrow(
      'warn',
      'TRPC error:',
      {
        message: error.message,
        cause: error.cause,
        code: error.code,
        statusCode,
        transactionId: ctx?.transactionId,
      },
      new TRPCError({
        ...error,
        cause: {
          status: 'error',
          statusCode,
          message: error.message,
        },
      })
    )
  }

  if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
    throw new ValidationError('Record already exists')
  }

  logAndThrow(
    'error',
    'Unexpected error:',
    { error },
    new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred. Please try again later.',
      cause: {
        status: 'error',
        statusCode: 500,
        message: 'An unexpected error occurred. Please try again later.',
      },
    })
  )
}
