import auth from '@/routes/auth/auth.index';
import index from '@/routes/root.route';
import tasks from '@/routes/tasks/tasks.index';

export const publicRoutes = [index, auth] as const;
export const privateRoutes = [tasks] as const;
