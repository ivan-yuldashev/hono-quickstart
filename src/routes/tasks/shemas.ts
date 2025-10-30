import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { tasks } from '@/infrastructure/db/schema';

export const selectTaskSchema = createSelectSchema(tasks);

export const insertTasksSchema = createInsertSchema(tasks, {
  name: (field) => field.min(1).max(200),
})
  .required({
    done: true,
  })
  .omit({
    createdAt: true,
    id: true,
    updatedAt: true,
  });

export const patchTasksSchema = insertTasksSchema.partial();
