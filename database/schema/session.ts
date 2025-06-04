import { index, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'

import { generateId } from '../../server/utils/coreHelper'

export const sessionsTable = pgTable(
  'sessions',
  {
    id: varchar('id', { length: 32 })
      .primaryKey()
      .$defaultFn(() => generateId()),
    token: varchar('token', { length: 255 }).notNull(),
    ip_address: varchar('ip_address', { length: 45 }).notNull(),
    user_agent: varchar('user_agent', { length: 512 }).notNull(),
    user_id: varchar('user_id', { length: 32 }).notNull(),
    expires_at: timestamp('expires_at').notNull(),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
    impersonatedBy: varchar('impersonatedBy', { length: 32 }),
  },
  (table) => [index('sessions_user_id_idx').on(table.user_id), index('sessions_token_idx').on(table.token)]
)
