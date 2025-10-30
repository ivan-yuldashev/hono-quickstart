import { createRouter } from '@/infrastructure/http/create-router';

import * as handlers from './auth.handlers';
import * as routes from './auth.routes';

const router = createRouter()
  .openapi(routes.login, handlers.login)
  .openapi(routes.logout, handlers.logout)
  .openapi(routes.register, handlers.register);

export default router;
