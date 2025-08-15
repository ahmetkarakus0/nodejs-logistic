import { config } from '@/config/env';
import { errorHandler } from '@/middlewares/error-handler';
import authRoutes from '@/modules/auth/auth.routes';
import customerLocationsRoutes from '@/modules/customer-locations/customer-locations.routes';
import customerRoutes from '@/modules/customers/customers.routes';
import express from 'express';
import { readFileSync } from 'fs';
import path, { join } from 'path';
import swaggerUI from 'swagger-ui-express';
import driverRoutes from '@/modules/drivers/drivers.routes';

const swaggerDark = readFileSync(
  join(__dirname, 'config', 'swagger', 'swagger-dark.css'),
  'utf8',
);
const swaggerPath = path.join(__dirname, 'config', 'swagger');
const swaggerRootFile = path.join(swaggerPath, 'swagger.json');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function loadSwagger() {
  try {
    const rootSpec = JSON.parse(readFileSync(swaggerRootFile, 'utf8'));
    const resolvedSpec = JSON.parse(JSON.stringify(rootSpec));

    function resolveRefs(obj: any): any {
      if (obj && typeof obj === 'object') {
        if ('$ref' in obj) {
          const refPath = obj.$ref;
          const fullPath = path.join(swaggerPath, refPath);
          try {
            const refContent = JSON.parse(readFileSync(fullPath, 'utf8'));
            return refContent;
          } catch (error) {
            console.error(`Failed to resolve ${refPath}:`, error);
            return obj;
          }
        } else {
          for (const key in obj) {
            if (obj[key] && typeof obj[key] === 'object') {
              obj[key] = resolveRefs(obj[key]);
            }
          }
        }
      }
      return obj;
    }

    // Resolve all $ref paths
    resolvedSpec.paths = resolveRefs(resolvedSpec.paths);

    return resolvedSpec;
  } catch (error) {
    console.error('Error loading Swagger specification:', error);
    throw error;
  }
}

// Load swagger before starting server
loadSwagger().then((swaggerDoc) => {
  // Serve swagger custom assets
  app.use('/swagger-assets', express.static(swaggerPath));

  // Swagger UI setup
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
  app.use('/api/v1/customers', customerRoutes);
  app.use('/api/v1/customer-locations', customerLocationsRoutes);
  app.use('/api/v1/drivers', driverRoutes);

  // Error handler middleware, must be at the bottom
  app.use(errorHandler);

  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(
      `Server is running on http://localhost:${PORT}. You can see the docs from http://localhost:${PORT}/api-docs`,
    );
  });
});
