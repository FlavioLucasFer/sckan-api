import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Priorities extends BaseSchema {
  protected tableName = 'priorities';

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary();
			table.integer('company_id').unsigned().references('id').inTable('companies').notNullable();
			table.string('name', 20).notNullable();
			table.string('color', 7).notNullable();
			table.integer('level').notNullable();
			table.timestamps(true);
			table.timestamp('deleted_at');
			table.index(['name', 'company_id'], 'priority_unique_index', 'unique');
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName);
  }
}
