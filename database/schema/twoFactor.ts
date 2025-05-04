import { index, mysqlTable, text, varchar } from 'drizzle-orm/mysql-core'

export const twoFactorTable = mysqlTable(
  'twoFactor',
  {
    id: varchar('id', { length: 32 })
      .primaryKey()
      .$defaultFn(() => generateId()),
    user_id: varchar('user_id', { length: 255 }).notNull(),
    secret: varchar('secret', { length: 255 }).notNull(),
    backupCodes: text('backupCodes').notNull(),
    created_at: varchar('created_at', { length: 255 }),
    updated_at: varchar('updated_at', { length: 255 }),
  },
  (table) => [index('secret').on(table.secret).using('btree')]
)
