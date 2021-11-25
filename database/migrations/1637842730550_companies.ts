import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Companies extends BaseSchema {
  protected tableName = 'companies';

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary();
			table.string('name', 255).unique().notNullable();
			table.string('trade_name', 255).unique();
			table.string('email', 255).unique().notNullable();
			table.specificType('logo', 'blob');
			table.timestamps(true);
			table.timestamp('deleted_at');
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName);
  }
}
