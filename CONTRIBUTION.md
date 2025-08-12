src/
├── config/ # App configuration (env, DB, Redis, CORS, etc.)
├── modules/ # Each domain (e.g. deliveries, auth) is isolated here
│ ├── auth/
│ │ ├── auth.controller.ts
│ │ ├── auth.service.ts
│ │ ├── auth.routes.ts
│ │ └── auth.types.ts
│ ├── vehicle/
│ ├── delivery/
│ ├── user/
│ └── ...
├── jobs/ # BullMQ jobs, schedulers
├── middlewares/ # Express middlewares
├── utils/ # Shared helpers (e.g. JWT, logger, formatters)
├── database/
│ ├── index.ts # DB connection
│ ├── prisma/ # (if using Prisma)
│ └── migrations/
├── redis/
│ └── index.ts # Redis connection, Pub/Sub
├── app.ts # Express app config
└── index.ts # Entry point

modules/delivery/
├── delivery.controller.ts # Handles HTTP logic
├── delivery.service.ts # Business logic
├── delivery.routes.ts # Express routes
├── delivery.types.ts # Interfaces & types
└── delivery.validators.ts # Zod/Yup validation (if used)

Create a new migration: yarn db-migrate create migration-name
Run migrations: yarn db-migrate up --env dev
Rollback migrations: yarn db-migrate down --env dev
