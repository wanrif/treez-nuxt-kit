import { index, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

import { generateId } from '../../server/utils/coreHelper'

export const twoFactorTable = pgTable(
  'twoFactor',
  {
    id: varchar('id', { length: 32 })
      .primaryKey()
      .$defaultFn(() => generateId()),
    user_id: varchar('user_id', { length: 255 }).notNull(),
    secret: varchar('secret', { length: 255 }).notNull(),
    backupCodes: text('backupCodes').notNull(),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
  },
  (table) => [index('secret').on(table.secret)]
)
