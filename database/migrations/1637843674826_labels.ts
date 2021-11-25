import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Labels extends BaseSchema {
  protected tableName = 'labels'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary();
			table.integer('company_id').unsigned().references('id').inTable('companies').notNullable();
			table.string('name', 20).unique().notNullable();
			table.string('description', 50);
			table.string('color', 7).notNullable();
      table.timestamps(true);
			table.timestamp('deleted_at');
			table.index(['name', 'company_id'], 'label_unique_index', 'unique');
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
