import express from 'express';
import { readFileSync } from 'fs';
import path, { join } from 'path';
import swaggerUI from 'swagger-ui-express';
import { config } from './config/env';
import swaggerDoc from './config/swagger/swagger.json';
import { errorHandler } from './middlewares/error-handler';
import authRoutes from './modules/auth/auth.routes';
import customerRoutes from './modules/customer/customer.routes';

const swaggerDark = readFileSync(
  join(__dirname, 'config', 'swagger', 'swagger-dark.css'),
  'utf8',
);
const swaggerPath = path.join(__dirname, 'config', 'swagger');

const app = express();

// Configs
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger
app.use('/swagger-assets', express.static(swaggerPath));
app.use(
  '/api-docs',
  swaggerUI.serve,
  swaggerUI.setup(swaggerDoc, {
    customCss: swaggerDark,
    customSiteTitle: 'Logistic App API',
    customJs: '/swagger-assets/swagger-custom.js',
  }),
);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/customer', customerRoutes);

// Error handler middleware, must be at the bottom
app.use(errorHandler);

const PORT = config.port;
app.listen(PORT, () => {
  console.log(
    `Server is running on http://localhost:${PORT}. You can see the docs from http://localhost:${PORT}/api-docs`,
  );
});
