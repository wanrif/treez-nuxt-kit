/* eslint-disable no-console */
import { faker } from '@faker-js/faker'
import { hash } from '@node-rs/argon2'

import { useDrizzle } from '~/server/utils/drizzle'

import { accountTable } from '../schema'
import { usersTable } from '../schema/user'

const defaultUsers = [
  {
    name: 'Admin Role',
    email: 'admin@treeznuxtify.com',
    email_verified: false,
    role: 'admin',
  },
  {
    name: 'User Role',
    email: 'user@treeznuxtify.com',
    email_verified: false,
    role: 'user',
  },
]

// Generate 100 random users
const randomUsers = Array.from({ length: 100 }, () => ({
  name: faker.person.fullName(),
  email: faker.internet.email(),
  role: faker.helpers.arrayElement(['user', 'admin']),
}))

const users = [...defaultUsers, ...randomUsers]

export async function seedUsers() {
  const db = useDrizzle()

  try {
    console.log('🌱 Seeding users...')

    for (const user of users) {
      const hashedPassword = await hash('Pa$$w0rd!')

      // Insert user
      const insertedUser = await db
        .insert(usersTable)
        .values({
          name: user.name,
          email: user.email,
          role: user.role,
        })
        .onConflictDoUpdate({
          target: usersTable.email,
          set: {
            name: user.name,
            role: user.role,
          },
        })
        .returning()

      const userId = insertedUser[0]?.id
      if (!userId) {
        console.warn(`⚠️ Failed to get user ID for ${user.email}`)
        continue
      }

      // Insert account
      await db
        .insert(accountTable)
        .values({
          account_id: userId,
          provider_id: 'credential',
          user_id: userId,
          password: hashedPassword,
        })
        .onConflictDoNothing()
    }

    console.log('✅ Users seeded successfully')
  } catch (error) {
    console.error('❌ Error seeding users:', error)
    throw error
  }
}
