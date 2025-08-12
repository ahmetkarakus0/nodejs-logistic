'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await db.runSql(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
  await db.runSql(
    `CREATE TYPE user_role AS ENUM ('admin', 'driver', 'customer');`,
  );

  return db.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      defaultValue: new String('gen_random_uuid()'),
    },
    name: { type: 'string', length: 255, notNull: true },
    surname: { type: 'string', length: 255, notNull: true },
    phone: { type: 'string', length: 255, notNull: true, unique: true },
    password: { type: 'string', length: 255, notNull: true },
    role: { type: 'user_role', notNull: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      defaultValue: new String('now()'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      defaultValue: new String('now()'),
    },
  });
};

exports.down = async function (db) {
  await db.dropTable('users', { cascade: true });
  await db.runSql(`DROP TYPE IF EXISTS user_role;`);
};

exports._meta = {
  version: 1,
};
