import { index, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'

import { generateId } from '../../server/utils/coreHelper'
import { usersTable } from './user'

export const accountTable = pgTable(
  'accounts',
  {
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
    access_token_expires_at: timestamp('access_token_expires_at'),
    refresh_token_expires_at: timestamp('refresh_token_expires_at'),
    password: varchar('password', { length: 255 }).notNull(),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
  },
  (table) => [index('accounts_user_id_idx').on(table.user_id)]
)
