import { index, mysqlTable, varchar } from 'drizzle-orm/mysql-core'

export const verificationTable = mysqlTable(
  'verifications',
  {
    id: varchar('id', { length: 32 })
      .primaryKey()
      .$defaultFn(() => generateId()),
    identifier: varchar('identifier', { length: 255 }).notNull(),
    value: varchar('value', { length: 255 }).notNull(),
    expires_at: varchar('expires_at', { length: 255 }),
    created_at: varchar('created_at', { length: 255 }),
    updated_at: varchar('updated_at', { length: 255 }),
  },

  (table) => [index('identifier_idx').on(table.identifier).using('btree')]
)
