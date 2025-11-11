import { tasks } from '@/infrastructure/db/schema';
import { BaseRepository } from '@/repositories/base.repository';

export const taskRepository = new BaseRepository(tasks);
