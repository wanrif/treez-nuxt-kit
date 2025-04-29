import { mysqlTable, varchar } from 'drizzle-orm/mysql-core'

import { usersTable } from './user'

export const accountTable = mysqlTable('accounts', {
  id: varchar('id', { length: 32 })
    .primaryKey()
    .$defaultFn(() => generateId()),
  account_id: varchar('account_id', { length: 255 }).notNull(),
  provider_id: varchar('provider_id', { length: 255 }).notNull(),
  user_id: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => usersTable.id),
  access_token: varchar('access_token', { length: 255 }),
  refresh_token: varchar('refresh_token', { length: 255 }),
  id_token: varchar('id_token', { length: 255 }),
  access_token_expires_at: varchar('access_token_expires_at', { length: 255 }),
  refresh_token_expires_at: varchar('refresh_token_expires_at', { length: 255 }),
  password: varchar('password', { length: 255 }).notNull(),
  created_at: varchar('created_at', { length: 255 }),
  updated_at: varchar('updated_at', { length: 255 }),
})
