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
  // Ensure pgcrypto is available for UUID generation
  await db.runSql(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

  // Create table with raw SQL to avoid type-prep issues
  await db.runSql(`
    CREATE TABLE two_factor_codes (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      code VARCHAR NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      user_id uuid NOT NULL REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      is_used BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    );
  `);

  // Auto-update updated_at field on UPDATE
  await db.runSql(`
    CREATE OR REPLACE FUNCTION update_two_factor_codes_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  await db.runSql(`
    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON two_factor_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_two_factor_codes_updated_at_column();
  `);
};

exports.down = async function (db) {
  await db.runSql(`DROP TRIGGER IF EXISTS set_updated_at ON two_factor_codes;`);
  await db.runSql(
    `DROP FUNCTION IF EXISTS update_two_factor_codes_updated_at_column;`,
  );
  await db.runSql(`DROP TABLE IF EXISTS two_factor_codes CASCADE;`);
};

exports._meta = {
  version: 1,
};
