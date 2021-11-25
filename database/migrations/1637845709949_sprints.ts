import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Sprints extends BaseSchema {
  protected tableName = 'sprints'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary();
			table.integer('project_id').unsigned().references('id').inTable('projects').notNullable();
			table.string('name', 50);
			table.string('description', 255);
			table.timestamp('starts_at').notNullable();
			table.timestamp('ends_at').notNullable();
			table.timestamp('started_at');
			table.timestamp('ended_at');
			table.timestamps(true);
			table.timestamp('deleted_at');
			table.index(['name', 'project_id'], 'sprint_unique_index', 'unique');
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
