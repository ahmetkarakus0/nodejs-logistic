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

  return db.createTable('two_factor_codes', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      defaultValue: new String('gen_random_uuid()'),
    },
    code: {
      type: 'string',
      notNull: true,
    },
    expires_at: {
      type: 'timestamp',
      notNull: true,
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      foreignKey: {
        name: 'fk_two_factor_codes_user_id',
        table: 'users',
        mapping: 'id',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
      },
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

exports.down = async function (db) {
  await db.runSql(
    `ALTER TABLE two_factor_codes DROP CONSTRAINT fk_two_factor_codes_user_id`,
  );
  return db.dropTable('two_factor_codes');
};

exports._meta = {
  version: 1,
};
