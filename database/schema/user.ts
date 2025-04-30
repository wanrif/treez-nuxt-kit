import { index, int, mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core'

export const usersTable = mysqlTable(
  'users',
  {
    id: varchar('id', { length: 32 })
      .primaryKey()
      .$defaultFn(() => generateId()),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    email_verified: int('email_verified', {
      unsigned: true,
    })
      .notNull()
      .default(0),
    phone: varchar({ length: 15 }).unique(),
    location: varchar({ length: 255 }),
    website: varchar({ length: 255 }),
    bio: varchar({ length: 255 }),
    // password: varchar({ length: 255 }).notNull(),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  },
  (table) => [index('email_idx').on(table.email).using('btree'), index('phone_idx').on(table.phone).using('btree')]
)
