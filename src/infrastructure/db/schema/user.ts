import { pgTable, text, varchar } from 'drizzle-orm/pg-core';

import { baseSchema } from '@/infrastructure/db/schema/base';

export const users = pgTable('users', {
  email: varchar('email', { length: 255 }).notNull().unique(),
  hash: text('hash').notNull(),
  ...baseSchema,
});
