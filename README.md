# **Hono Quickstart**

An opinionated, production-focused starter for Hono. This template provides an end-to-end type-safe stack, featuring a **Modular Architecture**, Drizzle ORM, PostgreSQL, Zod, and automated OpenAPI documentation.

- [Hono Quickstart](https://www.google.com/search?q=%23hono-quickstart)
  - [Included](https://www.google.com/search?q=%23included)
  - [Philosophy](https://www.google.com/search?q=%23philosophy)
  - [Setup](https://www.google.com/search?q=%23setup)
  - [Code Tour](https://www.google.com/search?q=%23code-tour)
    - [Directory Structure](https://www.google.com/search?q=%23directory-structure)
    - [Service Layer](https://www.google.com/search?q=%23service-layer)
  - [Testing](https://www.google.com/search?q=%23testing)
  - [Features](https://www.google.com/search?q=%23features)
    - [Dual JWT Authentication](https://www.google.com/search?q=%23dual-jwt-authentication)
    - [Graceful Shutdown](https://www.google.com/search?q=%23graceful-shutdown)
    - [Environment Variable Validation](https://www.google.com/search?q=%23environment-variable-validation)
    - [Unified Error Format](https://www.google.com/search?q=%23unified-error-format)
  - [Endpoints](https://www.google.com/search?q=%23endpoints)
  - [Deployment](https://www.google.com/search?q=%23deployment)
  - [Contributing](https://www.google.com/search?q=%23contributing)
  - [Acknowledgements](https://www.google.com/search?q=%23acknowledgements)
  - [References](https://www.google.com/search?q=%23references)

## **Included**

- Structured logging with [pino](https://getpino.io/) / [hono-pino](https://www.npmjs.com/package/hono-pino)
- Documented / type-safe routes with [@hono/zod-openapi](https://github.com/honojs/middleware/tree/main/packages/zod-openapi)
- Interactive API documentation with [scalar](https://scalar.com/#api-docs) / [@scalar/hono-api-reference](https://github.com/scalar/scalar/tree/main/packages/hono-api-reference)
- Convenience methods / helpers to reduce boilerplate with [stoker](https://www.npmjs.com/package/stoker)
- Type-safe schemas and environment variables with [zod](https://zod.dev/)
- Single source of truth database schemas with [PostgreSQL](https://www.postgresql.org/), [Drizzle ORM](https://orm.drizzle.team/docs/overview) and [drizzle-zod](https://orm.drizzle.team/docs/zod)
- Testing with [Vitest](https://vitest.dev/)
- Sensible editor, formatting and linting settings with [@antfu/eslint-config](https://github.com/antfu/eslint-config)
- **Advanced Authentication**: Dual JWT (Access Token in body \+ Refresh Token in httpOnly Cookie) with token rotation.
- **Modular Architecture**: Domain-driven structure.
- Graceful shutdown with [Terminus](https://github.com/godaddy/terminus)
- Unified error format

## **Philosophy**

This template is built with a few core principles in mind:

**Type-Safety End-to-End:** From database schemas (Drizzle \+ Zod) to API endpoints (@hono/zod-openapi), types are the source of truth, reducing runtime errors.

**Modular Architecture:** The project is organized by domain modules (e.g., auth, users, tasks) rather than technical layers. This Vertical Slice approach keeps related logic (routes, services, schemas) together, making the codebase easier to navigate and scale.

**Developer Experience (DX):** Fast setup (degit), automated testing with a real database (Vitest \+ Docker), and smart linting (@antfu/eslint-config) are prioritized.

**Production-Ready:** Includes essentials like structured logging (pino), graceful shutdown (terminus), and environment validation (zod) from the start.

## **Setup**

Clone this template without git history

```sh
npx degit ivan-yuldashev/hono-quickstart my-api
```

```sh
cd my-api
```

Create .env file

```sh
cp .env.example .env
```

**Note:** See .env.example for a list of all required environment variables. Typesafe env is defined in [env.ts](https://www.google.com/search?q=./src/infrastructure/config/env.ts). The application will not start if any required environment variables are missing.

Install dependencies

```sh
corepack enable
```

```sh
pnpm install
```

Run the database

```sh
docker-compose \-f docker-compose.dev.yml up \-d
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

## **Code Tour**

The project uses a **Modular Architecture**. Instead of scattering code across global controllers or routes folders, everything related to a specific domain is encapsulated within src/modules.

### **Directory Structure**

```sh
src/
|-- app/ \# Core Hono setup, middleware & AppType
|-- infrastructure/ \# Technical concerns (DB, Logger, Env)
|-- modules/ \# Business Domains (Vertical Slices)
| |-- auth/ \# Example module
| | |-- auth.routes.ts
| | |-- auth.service.ts
| | |-- ...
| |-- users/
| |-- tasks/
|-- shared/ \# Shared Utilities, Types, Constants
```

- src/app: Contains the core Hono app creation, global middleware registration, and module aggregation.
- src/infrastructure: Contains shared technical concerns: database connection (Drizzle), config, logger, **Service Factory**, and base classes.
- src/modules: Contains the business domains. Each module is self-contained.
- src/shared: Contains shared code, such as types, constants, and utility functions used across modules.

**RPC Client Support:** All app routes are grouped together and exported into single type as AppType in src/app/app.ts for use in [RPC / hono/client](https://hono.dev/docs/guides/rpc).

### **Service Layer**

The application employs a **hybrid service architecture**, combining automated CRUD with custom domain logic.

#### **1\. Dynamic Service Factory (BaseService)**

Found in src/infrastructure/services/helpers/create-services.ts.
This factory automatically creates a BaseService for every Drizzle table defined in the schema and injects them into the Hono context via middleware.
**Usage Example:**

You can access any auto-generated service directly from the context using c.get('services').

```sh
export const list: AppRouteHandler\<ListRoute\> \= async (c) \=\> {
const { limit, offset } \= c.req.valid('query');

// Access the dynamic service for 'tasks'
const { tasks } \= c.get('services');

// Uses BaseService.find() which handles pagination automatically
const data \= await tasks.find({ limit, offset });

return c.json(data, HttpStatusCodes.OK);
};
```

**BaseService Methods:**

The auto-generated services provide a comprehensive set of methods for interacting with the database.

**Read Operations:**

- **find(params)**:
  - **Input**: { limit, offset, where?, with?, orderBy? }
  - **Output**: Promise\<Page\<Data\>\> ({ docs, total })
  - **Description**: Combines repository calls (findBy and count) in parallel to return a paginated response.
- **findById(id)**:
  - **Input**: IdType\<Data\>
  - **Output**: Promise\<Data | undefined\>
  - **Description**: Fetches a single record by its primary key.
- **count(params)**:
  - **Input**: CountParams (e.g. { where })
  - **Output**: Promise\<number\>
  - **Description**: Returns the count of records matching the criteria.

**Write Operations:**

- **create(data)**:
  - **Input**: WithoutBaseFields\<Data\>
  - **Output**: Promise\<Data | undefined\>
  - **Description**: Validates and inserts a new record into the database.
- **updateById(id, raw)**:
  - **Input**: IdType\<Data\>, FullPartial\<WithoutBaseFields\<Data\>\>
  - **Output**: Promise\<Data | undefined\>
  - **Description**: Updates a record by ID. Automatically sanitizes the input (removes undefined keys) before passing data to the repository, making it perfect for PATCH requests.
- **update(raw, where)**:
  - **Input**: FullPartial\<WithoutBaseFields\<Data\>\>, SQL
  - **Output**: Promise\<Data\[\]\>
  - **Description**: Bulk updates records matching the where clause. Also sanitizes input.
- **deleteById(id)**:
  - **Input**: IdType\<Data\>
  - **Output**: Promise\<Data | undefined\>
  - **Description**: Deletes a single record by its ID.
- **delete(where)**:
  - **Input**: SQL
  - **Output**: Promise\<Data\[\]\>
  - **Description**: Bulk deletes records matching the where clause.

#### **2\. Domain Services (Custom Logic)**

For complex business logic that goes beyond simple CRUD (e.g., Authentication, Transactions), specific services are defined within their modules (e.g., src/modules/auth/auth.service.ts).

- **Example (AuthService):**
  - Orchestrates operations between UserRepository and TokenRepository.
  - **Login/Register:** Handles password verification (using safe comparison) and hashing.
  - **Token Rotation:** Implements **Refresh Token Rotation**. If a revoked token is used, the system detects a potential breach and revokes all tokens for that user (Reuse Detection).

## **Testing**

This project uses [Vitest](https://vitest.dev/) for testing. Test files are located in the tests directory or colocated within modules (depending on preference).

When you run the test command, a global setup script (tests/global-setup.ts) is executed. This script automatically:

1. Starts a PostgreSQL database in a Docker container using the docker-compose.test.yml file.
2. Applies the latest database schema using Drizzle.
3. After the tests complete, a teardown script automatically stops and removes the Docker container.

You can run the tests with the following command:

pnpm test

## **Features**

### **Dual JWT Authentication**

The application implements a robust authentication strategy using two tokens:

1. **Access Token:** Short-lived, returned in the response body. Used for authorizing API requests via the Authorization: Bearer header.
2. **Refresh Token:** Long-lived, stored in a secure httpOnly cookie. Used to obtain a new Access Token when the current one expires.

**Rotation:** The system supports Refresh Token Rotation to detect token reuse and enhance security.

### **Graceful Shutdown**

The application uses [Terminus](https://github.com/godaddy/terminus) to gracefully shut down the server. This ensures that all active connections are closed before the process exits, preventing data loss and ensuring a clean shutdown.

### **Environment Variable Validation**

The application uses [Zod](https://zod.dev/) to validate environment variables at startup. This ensures that all required environment variables are present and have the correct type, preventing runtime errors. The environment variable schema and validation logic can be found in src/infrastructure/config/env.ts.

### **Unified Error Format**

The application uses a unified error format for all API responses. This makes it easier for clients to handle errors in a consistent way. The error handling logic can be found in src/infrastructure/http/helpers/on-error.ts.

## **Endpoints**

| Path                | Description                                                |
| :------------------ | :--------------------------------------------------------- |
| **System**          |                                                            |
| GET /health         | Health check                                               |
| GET /openapi        | Open API Specification (JSON)                              |
| GET /doc            | Scalar API Documentation                                   |
| **Auth**            |                                                            |
| POST /register      | Register a new user                                        |
| POST /login         | Login a user (Returns Access Token \+ Sets Refresh Cookie) |
| POST /logout        | Logout a user (Clears Refresh Cookie)                      |
| POST /refresh-token | Refresh Access Token using the cookie                      |
| **Tasks**           |                                                            |
| GET /tasks          | List all tasks                                             |
| POST /tasks         | Create a task                                              |
| GET /tasks/{id}     | Get one task by id                                         |
| PATCH /tasks/{id}   | Patch one task by id                                       |
| DELETE /tasks/{id}  | Delete one task by id                                      |

## **Deployment**

This starter is configured to run as a Node.js server (see src/index.ts). You can build a production-ready Docker image and deploy it to any platform that supports Docker containers.

A Dockerfile is not included, but you can easily add one based on a lightweight Node.js image.

## **Contributing**

Contributions are welcome\! Please feel free to open an issue or submit a pull request.

1. Fork the repository.
2. Create a new branch (git checkout \-b feature/your-feature).
3. Make your changes.
4. Run tests (pnpm test) and lint (pnpm lint).
5. Commit your changes (git commit \-m 'Add some feature').
6. Push to the branch (git push origin feature/your-feature).
7. Open a Pull Request.

## **Acknowledgements**

This project is based on the original work of [w3cj/hono-open-api-starter](https://github.com/w3cj/hono-open-api-starter).

## **References**

- [What is Open API?](https://swagger.io/docs/specification/v3_0/about/)
- [Hono](https://hono.dev/)
  - [Zod OpenAPI Example](https://hono.dev/examples/zod-openapi)
  - [Testing](https://hono.dev/docs/guides/testing)
  - [Testing Helper](https://hono.dev/docs/helpers/testing)
- [@hono/zod-openapi](https://github.com/honojs/middleware/tree/main/packages/zod-openapi)
- [Scalar Documentation](https://github.com/scalar/scalar/tree/main/?tab=readme-ov-file#documentation)
  - [Themes / Layout](https://github.com/scalar/scalar/blob/main/documentation/themes.md)
  - [Configuration](https://github.com/scalar/scalar/blob/main/documentation/configuration.md)

```

```
