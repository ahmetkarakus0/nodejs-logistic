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

  // Create table using raw SQL
  await db.runSql(`
    CREATE TABLE reset_password_tokens (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      token VARCHAR NOT NULL,
      phone VARCHAR NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      is_used BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    );
  `);

  // Auto-update updated_at field
  await db.runSql(`
    CREATE OR REPLACE FUNCTION update_reset_password_tokens_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  await db.runSql(`
    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON reset_password_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_reset_password_tokens_updated_at_column();
  `);
};

exports.down = async function (db) {
  await db.runSql(
    `DROP TRIGGER IF EXISTS set_updated_at ON reset_password_tokens;`,
  );
  await db.runSql(
    `DROP FUNCTION IF EXISTS update_reset_password_tokens_updated_at_column;`,
  );
  await db.runSql(`DROP TABLE IF EXISTS reset_password_tokens CASCADE;`);
};

exports._meta = {
  version: 1,
};
