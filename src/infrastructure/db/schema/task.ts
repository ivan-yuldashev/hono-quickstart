import { desc } from 'drizzle-orm';
import { boolean, index, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '@/infrastructure/db/helpers/timestamps';

export const tasks = pgTable(
  'tasks',
  {
    done: boolean().notNull().default(false),
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 200 }).notNull(),
    ...timestamps,
  },
  (t) => [index('created_at_idx').on(desc(t.createdAt))],
);
