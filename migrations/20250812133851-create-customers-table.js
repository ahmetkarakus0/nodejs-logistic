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

  return db.createTable('customers', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      defaultValue: new String('gen_random_uuid()'),
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      unique: true,
      foreignKey: {
        name: 'fk_customers_user_id',
        table: 'users',
        mapping: 'id',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
      },
    },
    company_name: { type: 'string', length: 255, notNull: true },
    email: { type: 'string', length: 255, notNull: true },
    billing_info: { type: 'jsonb', notNull: true, defaultValue: '{}' },
    /**
     * billing_address: {
     *   street: "123 Main St",
     *   city: "Istanbul",
     *   postal_code: "34000",
     *   country: "Turkey"
     * },
     * tax_id: "1234567890",
     * payment_method: "credit_card",
     * contacts: [
     *   {
     *     name: "Finance Dept.",
     *     email: "finance@example.com",
     *     phone: "+901234567890"
     *   }
     * ]
     */
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
  await db.runSql(`ALTER TABLE customers DROP CONSTRAINT fk_customers_user_id`);
  await db.dropTable('customers');
};

exports._meta = {
  version: 1,
};
