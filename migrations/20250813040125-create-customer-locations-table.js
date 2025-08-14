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

  return db.createTable('customer_locations', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      defaultValue: new String('gen_random_uuid()'),
    },
    customer_id: {
      type: 'uuid',
      notNull: true,
      foreignKey: {
        name: 'fk_customer_locations_customer_id',
        table: 'customers',
        mapping: 'id',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
      },
    },
    label: {
      type: 'string',
      notNull: true,
    },
    address_line_1: {
      type: 'string',
      notNull: true,
    },
    address_line_2: {
      type: 'string',
      notNull: false,
    },
    city: {
      type: 'string',
      notNull: true,
    },
    state: {
      type: 'string',
      notNull: false,
    },
    postal_code: {
      type: 'string',
      notNull: true,
    },
    country: {
      type: 'string',
      notNull: true,
    },
    latitude: {
      type: 'decimal',
      notNull: true,
    },
    longitude: {
      type: 'decimal',
      notNull: true,
    },
    type: {
      type: 'location_type',
      notNull: true,
    },
    is_primary: {
      type: 'boolean',
      notNull: true,
      defaultValue: false,
    },
    notes: {
      type: 'string',
      notNull: false,
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
    `ALTER TABLE customer_locations DROP CONSTRAINT fk_customer_locations_customer_id`,
  );
  await db.dropTable('customer_locations');
  await db.runSql(`DROP TYPE IF EXISTS location_type;`);
};

exports._meta = {
  version: 1,
};
