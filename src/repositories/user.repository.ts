import { users } from '@/infrastructure/db/schema';
import { BaseRepository } from '@/repositories/base.repository';

export const userRepository = new BaseRepository(users);
