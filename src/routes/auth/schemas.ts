import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { users } from '@/infrastructure/db/schema';

export const selectUsersSchema = createSelectSchema(users).omit({
  hash: true,
});

const authSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const loginSchema = authSchema;
export const registerSchema = authSchema;
