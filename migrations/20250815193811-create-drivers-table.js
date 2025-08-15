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

  // Create status enum type
  await db.runSql(`
    DO $$ BEGIN
      CREATE TYPE driver_status AS ENUM ('active', 'inactive', 'suspended');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Create drivers table with raw SQL
  await db.runSql(`
    CREATE TABLE drivers (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid UNIQUE NOT NULL REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      license_number VARCHAR(255) NOT NULL,
      license_expiry_date DATE NOT NULL,
      date_of_birth DATE NOT NULL,
      address VARCHAR(500) NOT NULL,
      emergency_contact_name VARCHAR(255) NOT NULL,
      emergency_contact_phone VARCHAR(20) NOT NULL,
      employment_start_date DATE NOT NULL,
      employment_end_date DATE,
      status driver_status NOT NULL DEFAULT 'active',
      notes TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    );
  `);

  // Auto-update updated_at on row update
  await db.runSql(`
    CREATE OR REPLACE FUNCTION update_drivers_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE 'plpgsql';
  `);

  await db.runSql(`
    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON drivers
    FOR EACH ROW
    EXECUTE FUNCTION update_drivers_updated_at_column();
  `);
};

exports.down = async function (db) {
  await db.runSql(`DROP TRIGGER IF EXISTS set_updated_at ON drivers;`);
  await db.runSql(`DROP FUNCTION IF EXISTS update_drivers_updated_at_column;`);
  await db.runSql(`DROP TABLE IF EXISTS drivers CASCADE;`);
  await db.runSql(`DROP TYPE IF EXISTS driver_status;`);
};

exports._meta = {
  version: 1,
};
