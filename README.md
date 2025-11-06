# Hono Quickstart

A starter template for building fully documented type-safe JSON APIs with Hono and Open API. This project is based on the original work of [w3cj/hono-open-api-starter](https://github.com/w3cj/hono-open-api-starter).

- [Hono Quickstart](#hono-open-api-starter)
  - [Included](#included)
  - [Philosophy](#philosophy)
  - [Setup](#setup)
  - [Code Tour](#code-tour)
  - [Testing](#testing)
  - [Features](#features)
    - [Graceful Shutdown](#graceful-shutdown)
    - [Environment Variable Validation](#environment-variable-validation)
    - [Unified Error Format](#unified-error-format)
  - [Endpoints](#endpoints)
  - [Deployment](#deployment)
  - [Contributing](#contributing)
  - [References](#references)

## Included

- Structured logging with [pino](https://getpino.io/) / [hono-pino](https://www.npmjs.com/package/hono-pino)
- Documented / type-safe routes with [@hono/zod-openapi](https://github.com/honojs/middleware/tree/main/packages/zod-openapi)
- Interactive API documentation with [scalar](https://scalar.com/#api-docs) / [@scalar/hono-api-reference](https://github.com/scalar/scalar/tree/main/packages/hono-api-reference)
- Convenience methods / helpers to reduce boilerplate with [stoker](https://www.npmjs.com/package/stoker)
- Type-safe schemas and environment variables with [zod](https://zod.dev/)
- Single source of truth database schemas with [PostgreSQL](https://www.postgresql.org/), [Drizzle ORM](https://orm.drizzle.team/docs/overview) and [drizzle-zod](https://orm.drizzle.team/docs/zod)
- Testing with [Vitest](https://vitest.dev/)
- Sensible editor, formatting and linting settings with [@antfu/eslint-config](https://github.com/antfu/eslint-config)
- Authentication with JWT [hono/jwt](https://hono.dev/docs/middleware/builtin/jwt)
- Layered architecture
- Graceful shutdown with [Terminus](https://github.com/godaddy/terminus)
- [In Progress] Unified error format

## Philosophy

This template is built with a few core principles in mind:

Type-Safety End-to-End: From database schemas (Drizzle + Zod) to API endpoints (@hono/zod-openapi), types are the source of truth, reducing runtime errors.

Scalable Architecture: The layered architecture (infrastructure, app, routes) promotes separation of concerns, making the codebase easier to maintain and grow.

Developer Experience (DX): Fast setup (degit), automated testing with a real database (Vitest + Docker), and smart linting (@antfu/eslint-config) are prioritized.

Production-Ready: Includes essentials like structured logging (pino), graceful shutdown (terminus), and environment validation (zod) from the start.

## Setup

Clone this template without git history

```sh
npx degit ivan-yuldashev/hono-quickstart my-api
cd my-api
```

Create `.env` file

```sh
cp .env.example .env
```

Install dependencies

```sh
corepack enable
pnpm install
```

Run the database

```sh
docker-compose -f docker-compose.dev.yml up -d
```

Generate database migrations

```sh
pnpm db:generate
```

Run database migrations

```sh
pnpm db:migrate
```

Run

```sh
pnpm dev
```

Lint

```sh
pnpm lint
```

Test

```sh
pnpm test
```

## Code Tour

The project uses a layered architecture with the following directories:

- `src/app`: Contains the core application logic, including the Hono app creation and route registration.
- `src/infrastructure`: Contains the infrastructure code, such as the database schema, migrations, and external service integrations.
- `src/routes`: Contains the route definitions, handlers, and tests.
- `src/shared`: Contains shared code, such as types, constants, and utility functions.

Typesafe env defined in [env.ts](./src/infrastructure/config/env.ts) - add any other required environment variables here. The application will not start if any required environment variables are missing

The `src/routes` directory contains examples for both public (`auth`) and private (`tasks`) route groups. Use these as a template for creating your own route groups.

**Auth Routes (`src/routes/auth`)**

- **Router:** `auth.index.ts`
- **Route Definitions:** `auth.routes.ts`
- **Handlers:** `auth.handlers.ts`
- **Schemas:** `schemas.ts`

**Task Routes (`src/routes/tasks`)**

- **Router:** `tasks.index.ts`
- **Route Definitions:** `tasks.routes.ts`
- **Handlers:** `tasks.handlers.ts`
- **Schemas:** `shemas.ts`

All app routes are grouped together and exported into single type as `AppType` in [app.ts](./src/app/create-app.ts) for use in [RPC / hono/client](https://hono.dev/docs/guides/rpc).

## Testing

This project uses [Vitest](https://vitest.dev/) for testing. All test files are located in the `tests` directory, which mirrors the structure of the `src` directory.

When you run the test command, a global setup script (`tests/global-setup.ts`) is executed. This script automatically:

1. Starts a PostgreSQL database in a Docker container using the `docker-compose.test.yml` file.
2. Applies the latest database schema using Drizzle.
3. After the tests complete, a teardown script automatically stops and removes the Docker container.

You can run the tests with the following command:

```sh
pnpm test
```

## Features

### Graceful Shutdown

The application uses [Terminus](https://github.com/godaddy/terminus) to gracefully shut down the server. This ensures that all active connections are closed before the process exits, preventing data loss and ensuring a clean shutdown. The configuration can be found in `src/infrastructure/runtime/terminus/setup-terminus.ts`.

### Environment Variable Validation

The application uses [Zod](https://zod.dev/) to validate environment variables at startup. This ensures that all required environment variables are present and have the correct type, preventing runtime errors. The environment variable schema and validation logic can be found in `src/infrastructure/config/env.ts`.

### Unified Error Format

The application uses a unified error format for all API responses. This makes it easier for clients to handle errors in a consistent way. The error handling logic can be found in `src/infrastructure/http/helpers/on-error.ts`.

## Endpoints

| Path                | Description                   |
| ------------------- | ----------------------------- |
| GET /health         | Health check                  |
| GET /openapi        | Open API Specification (JSON) |
| GET /doc            | Scalar API Documentation      |
| POST /auth/register | Register a new user           |
| POST /auth/login    | Login a user                  |
| POST /auth/logout   | Logout a user                 |
| GET /tasks          | List all tasks                |
| POST /tasks         | Create a task                 |
| GET /tasks/{id}     | Get one task by id            |
| PATCH /tasks/{id}   | Patch one task by id          |
| DELETE /tasks/{id}  | Delete one task by id         |

## Deployment

his starter is configured to run as a Node.js server (see src/index.ts). You can build a production-ready Docker image and deploy it to any platform that supports Docker containers, such as:

- Any Virtual Private Server (VPS)

A Dockerfile is not included, but you can easily add one based on a lightweight Node.js image.

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes.
4. Run tests (`pnpm test`) and lint (`pnpm lint`).
5. Commit your changes (`git commit -m 'Add some feature'`).
6. Push to the branch (`git push origin feature/your-feature`).
7. Open a Pull Request.

## References

- [What is Open API?](https://swagger.io/docs/specification/v3_0/about/)
- [Hono](https://hono.dev/)
  - [Zod OpenAPI Example](https://hono.dev/examples/zod-openapi)
  - [Testing](https://hono.dev/docs/guides/testing)
  - [Testing Helper](https://hono.dev/docs/helpers/testing)
- [@hono/zod-openapi](https://github.com/honojs/middleware/tree/main/packages/zod-openapi)
- [Scalar Documentation](https://github.com/scalar/scalar/tree/main/?tab=readme-ov-file#documentation)
  - [Themes / Layout](https://github.com/scalar/scalar/blob/main/documentation/themes.md)
  - [Configuration](https://github.com/scalar/scalar/blob/main/documentation/configuration.md)
