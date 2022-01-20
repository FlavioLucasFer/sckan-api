import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Statuses extends BaseSchema {
  protected tableName = 'statuses';

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary();
			table.integer('company_id').unsigned().references('id').inTable('companies').notNullable();
			table.integer('previous_status_id').unsigned().references('id').inTable('statuses');
			table.integer('next_status_id').unsigned().references('id').inTable('statuses');
			table.string('name', 20).notNullable();
			table.timestamps(true);
			table.timestamp('deleted_at');
			table.index(['name', 'company_id'], 'status_unique_index', 'unique');
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName);
  }
}
