import { boolean, index, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'

import { generateId } from '../../server/utils/coreHelper'

export const usersTable = pgTable(
  'users',
  {
    id: varchar('id', { length: 32 })
      .primaryKey()
      .$defaultFn(() => generateId()),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    email_verified: boolean('email_verified').notNull().default(false),
    phone: varchar({ length: 15 }).unique(),
    location: varchar({ length: 255 }),
    website: varchar({ length: 255 }),
    bio: varchar({ length: 255 }),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
    role: varchar({ length: 255 }).default('user'),
    banned: boolean('banned').notNull().default(false),
    banReason: varchar({ length: 255 }),
    banExpires: timestamp('banExpires'),
    twoFactorEnabled: boolean('twoFactorEnabled').notNull().default(false),
  },
  (table) => [index('email_idx').on(table.email)]
)
