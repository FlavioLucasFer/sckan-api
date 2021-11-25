import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Projects extends BaseSchema {
  protected tableName = 'projects'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary();
			table.integer('company_id').unsigned().references('id').inTable('companies').notNullable;
			table.integer('responsible_id').unsigned().references('id').inTable('users').notNullable;
			table.string('name', 255).notNullable();
			table.text('description', 'long');
			table.string('contractor_name', 255);
			table.text('clone_url');
			table.specificType('logo', 'blob');
			table.timestamps(true);
			table.timestamp('deleted_at');
			table.index(['name', 'company_id'], 'project_unique_index', 'unique');
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
