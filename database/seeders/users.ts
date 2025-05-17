/* eslint-disable no-console */
import { eq } from 'drizzle-orm'

import { faker } from '@faker-js/faker'
import { hash } from '@node-rs/argon2'

import { useDrizzle } from '~/server/utils/drizzle'

import { accountTable } from '../schema'
import { usersTable } from '../schema/user'

const defaultUsers = [
  {
    name: 'Admin Role',
    email: 'admin@treeznuxtify.com',
    email_verified: 0,
    role: 'admin',
  },
  {
    name: 'User Role',
    email: 'user@treeznuxtify.com',
    email_verified: 0,
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
      await db
        .insert(usersTable)
        .values({
          name: user.name,
          email: user.email,
          role: user.role,
        })
        .onDuplicateKeyUpdate({
          set: {
            name: user.name,
            email: user.email,
            role: user.role,
          },
        })

      const findUser = await db.query.usersTable.findFirst({
        where: eq(usersTable.name, user?.name),
      })
      if (!findUser) {
        // Skip if user not found
        continue
      }
      // Insert account
      await db
        .insert(accountTable)
        .values({
          account_id: findUser.id,
          provider_id: 'credential',
          user_id: findUser.id,
          password: hashedPassword,
        })
        .onDuplicateKeyUpdate({
          set: {
            account_id: findUser.id,
            provider_id: 'credential',
            user_id: findUser.id,
            password: hashedPassword,
          },
        })
    }

    console.log('✅ Users seeded successfully')
  } catch (error) {
    console.error('❌ Error seeding users:', error)
    throw error
  }
}
