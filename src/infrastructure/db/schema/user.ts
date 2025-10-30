import { pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '@/infrastructure/db/helpers/timestamps';

export const users = pgTable('users', {
  email: varchar('email', { length: 255 }).notNull().unique(),
  hash: text('hash').notNull(),
  id: uuid('id').primaryKey().defaultRandom(),
  ...timestamps,
});
