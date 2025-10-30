import { serveEmojiFavicon } from 'stoker/middlewares';

import { privateRoutes, publicRoutes } from '@/app/routes';
import { jwt } from '@/infrastructure/auth/jwt';
import { createBaseApp } from '@/infrastructure/http/create-base-app';
import { createRouter } from '@/infrastructure/http/create-router';
import { configureOpenAPI } from '@/routes/openapi/configure-open-api';

export function createApp() {
  const app = createBaseApp();

  configureOpenAPI(app);

  app.use(serveEmojiFavicon('📝'));

  publicRoutes.forEach((route) => {
    app.route('/', route);
  });

  const authedApp = createRouter();
  authedApp.use(jwt);

  privateRoutes.forEach((route) => {
    authedApp.route('/', route);
  });

  app.route('/', authedApp);

  return app;
}
