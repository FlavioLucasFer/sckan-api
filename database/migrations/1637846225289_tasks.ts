import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Tasks extends BaseSchema {
  protected tableName = 'tasks';

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary();
			table.integer('user_id').unsigned().references('id').inTable('users').notNullable();
			table.integer('sprint_id').unsigned().references('id').inTable('sprints').notNullable();
			table.integer('status_id').unsigned().references('id').inTable('statuses').notNullable();
			table.integer('priority_id').unsigned().references('id').inTable('priorities').notNullable();
			table.string('name', 255).notNullable();
			table.string('description', 500).notNullable();
			table.float('planned_size').notNullable();
			table.float('size').notNullable().defaultTo(0);
			table.time('time_spent').notNullable().defaultTo(0);
			table.text('issue_url');
			table.timestamp('archived_at');
			table.timestamps(true);
			table.timestamp('deleted_at');
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName);
  }
}
