import express from 'express';
import { config } from './config/env';
import authRoutes from './modules/auth/auth.routes';
import { errorHandler } from './middlewares/error-handler';
import swaggerUI from 'swagger-ui-express';
import swaggerDoc from './config/swagger.json';
import { readFileSync } from 'fs';
import { join } from 'path';

const swaggerDark = readFileSync(
  join(__dirname, 'config', 'swagger-dark.css'),
  'utf8',
);

const app = express();

// Configs
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger
app.use(
  '/api-docs',
  swaggerUI.serve,
  swaggerUI.setup(swaggerDoc, {
    customCss: swaggerDark,
  }),
);

// Routes
app.use('/api/v1/auth', authRoutes);

// Error handler middleware, must be at the bottom
app.use(errorHandler);

const PORT = config.port;
app.listen(PORT, () => {
  console.log(
    `Server is running on http://localhost:${PORT}. You can see the docs from http://localhost:${PORT}/api-docs`,
  );
});
