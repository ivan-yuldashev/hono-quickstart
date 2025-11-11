import type { z } from 'zod';

import type { paginationSchema } from '@/shared/schemas/pagination-schema';

export type Pagination = z.infer<typeof paginationSchema>;

export interface Page<T> {
  docs: T[];
  total: number;
}
