import { index, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'

import { generateId } from '../../server/utils/coreHelper'

export const verificationTable = pgTable(
  'verifications',
  {
    id: varchar('id', { length: 32 })
      .primaryKey()
      .$defaultFn(() => generateId()),
    identifier: varchar('identifier', { length: 255 }).notNull(),
    value: varchar('value', { length: 255 }).notNull(),
    expires_at: timestamp('expires_at'),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
  },

  (table) => [index('identifier_idx').on(table.identifier)]
)
