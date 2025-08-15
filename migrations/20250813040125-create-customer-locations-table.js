'use strict';

var dbm;
var type;
var seed;

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  // Enable pgcrypto for UUID generation
  await db.runSql(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

  // Create custom enum type location_type if it doesn't exist
  await db.runSql(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'location_type') THEN
        CREATE TYPE location_type AS ENUM (
          'billing',
          'shipping',
          'warehouse',
          'pickup',
          'branch',
          'factory',
          'port',
          'customs',
          'hub',
          'transit',
          'other'
        );
      END IF;
    END$$;
  `);

  // Create table using raw SQL
  await db.runSql(`
    CREATE TABLE customer_locations (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id uuid NOT NULL REFERENCES customers(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      label VARCHAR NOT NULL,
      address_line_1 VARCHAR NOT NULL,
      address_line_2 VARCHAR,
      city VARCHAR NOT NULL,
      state VARCHAR,
      postal_code VARCHAR NOT NULL,
      country VARCHAR NOT NULL,
      latitude DECIMAL NOT NULL,
      longitude DECIMAL NOT NULL,
      type location_type NOT NULL,
      is_primary BOOLEAN NOT NULL DEFAULT false,
      notes VARCHAR,
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    );
  `);

  // Auto-update updated_at field
  await db.runSql(`
    CREATE OR REPLACE FUNCTION update_customer_locations_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE 'plpgsql';
  `);

  await db.runSql(`
    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON customer_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_locations_updated_at_column();
  `);
};

exports.down = async function (db) {
  await db.runSql(
    `DROP TRIGGER IF EXISTS set_updated_at ON customer_locations;`,
  );
  await db.runSql(
    `DROP FUNCTION IF EXISTS update_customer_locations_updated_at_column;`,
  );
  await db.runSql(`DROP TABLE IF EXISTS customer_locations CASCADE;`);
  await db.runSql(`DROP TYPE IF EXISTS location_type;`);
};

exports._meta = {
  version: 1,
};
