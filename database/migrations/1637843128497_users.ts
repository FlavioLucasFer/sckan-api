import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Users extends BaseSchema {
  protected tableName = 'users';

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary();
			table.integer('company_id').unsigned().references('id').inTable('companies').notNullable();
			table.string('role_id', 50).references('id').inTable('roles').notNullable();
			table.string('name', 255).notNullable();
			table.string('username', 255).unique().notNullable();
			table.string('password', 255).notNullable();
			table.string('email', 255).unique().notNullable();
			table.specificType('picture', 'mediumblob');
			table.timestamps(true);
			table.timestamp('deleted_at');
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName);
  }
}
