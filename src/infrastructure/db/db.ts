import { drizzle } from 'drizzle-orm/node-postgres';

import { pool } from '@/infrastructure/db/pool';
import * as schema from '@/infrastructure/db/schema';

const db = drizzle({ client: pool, schema });

export { db };
