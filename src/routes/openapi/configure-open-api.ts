import { Scalar } from '@scalar/hono-api-reference';

import type { AppOpenAPI } from '@/shared/types/app';

import { env } from '@/infrastructure/config/env';
import { Path } from '@/shared/constants/path';

import packageJSON from '../../../package.json' with { type: 'json' };

export function configureOpenAPI(app: AppOpenAPI) {
  app.openAPIRegistry.registerComponent('securitySchemes', 'cookieAuth', {
    description: `Example: '${env.COOKIE_NAME}=...`,
    in: 'header',
    name: 'Cookie',
    type: 'apiKey',
  });

  app.doc(Path.OPEN_API, {
    info: {
      title: 'Tasks API',
      version: packageJSON.version,
    },
    openapi: '3.0.0',
  });

  app.get(
    Path.DOC,
    Scalar({
      authentication: {
        preferredSecurityScheme: 'cookieAuth',
      },
      defaultHttpClient: {
        clientKey: 'fetch',
        targetKey: 'js',
      },
      layout: 'classic',
      theme: 'default',
      url: Path.OPEN_API,
    }),
  );
}
