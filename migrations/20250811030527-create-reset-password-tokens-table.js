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

  return db.createTable('reset_password_tokens', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      defaultValue: new String('gen_random_uuid()'),
    },
    token: {
      type: 'string',
      notNull: true,
    },
    phone: {
      type: 'string',
      notNull: true,
    },
    expires_at: {
      type: 'timestamp',
      notNull: true,
    },
    is_used: {
      type: 'boolean',
      notNull: true,
      defaultValue: false,
    },
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

exports.down = function (db) {
  return db.dropTable('reset_password_tokens');
};

exports._meta = {
  version: 1,
};
