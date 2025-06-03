import { customAlphabet } from 'nanoid'

// ======================================================================
// Transaction ID Generator
// ======================================================================

/**
 * Generates a unique transaction ID with the following format:
 * TREEZ + 10 random alphanumeric characters + current timestamp
 *
 * @example
 * const transactionId = generateTransactionId();
 * * Returns: TREEZAB12CD3EFG1234567890
 *
 * @returns {string} Unique transaction ID in format TREEZ[random][timestamp]
 */
export function generateTransactionId(): string {
  const prefix = 'TREEZ'
  const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10)
  const random = nanoid()
  const timestamp = Date.now()

  return `${prefix}${random}${timestamp}`
}
