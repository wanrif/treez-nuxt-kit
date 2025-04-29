import { mysqlTable, varchar } from 'drizzle-orm/mysql-core'

export const verificationTable = mysqlTable('verifications', {
  id: varchar('id', { length: 32 })
    .primaryKey()
    .$defaultFn(() => generateId()),
  identifier: varchar('identifier', { length: 255 }).notNull(),
  value: varchar('value', { length: 255 }).notNull(),
  expires_at: varchar('expires_at', { length: 255 }),
})
