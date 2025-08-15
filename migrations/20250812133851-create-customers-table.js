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

  // Create table with raw SQL
  await db.runSql(`
    CREATE TABLE customers (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid UNIQUE NOT NULL REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      company_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      billing_info JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      updated_at TIMESTAMP NOT NULL DEFAULT now(),
      deleted_at TIMESTAMP NULL
    );
  `);

  // Auto-update updated_at field
  await db.runSql(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  await db.runSql(`
    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
};

exports.down = async function (db) {
  await db.runSql(`DROP TRIGGER IF EXISTS set_updated_at ON customers;`);
  await db.runSql(`DROP FUNCTION IF EXISTS update_updated_at_column;`);
  await db.runSql(`DROP TABLE IF EXISTS customers CASCADE;`);
};

exports._meta = {
  version: 1,
};
