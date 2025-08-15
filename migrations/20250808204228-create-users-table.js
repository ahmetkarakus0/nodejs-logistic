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

  // Create custom enum type
  await db.runSql(`
    DO $$ BEGIN
      CREATE TYPE user_role AS ENUM ('admin', 'driver', 'customer');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Create table with raw SQL to avoid type-prep issues
  await db.runSql(`
    CREATE TABLE users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      surname VARCHAR(255) NOT NULL,
      phone VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role user_role NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    );
  `);

  // Auto-update updated_at on UPDATE
  await db.runSql(`
    CREATE OR REPLACE FUNCTION update_users_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  await db.runSql(`
    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_users_updated_at_column();
  `);
};

exports.down = async function (db) {
  await db.runSql(`DROP TRIGGER IF EXISTS set_updated_at ON users;`);
  await db.runSql(`DROP FUNCTION IF EXISTS update_users_updated_at_column;`);
  await db.runSql(`DROP TABLE IF EXISTS users CASCADE;`);
  await db.runSql(`DROP TYPE IF EXISTS user_role;`);
};

exports._meta = {
  version: 1,
};
