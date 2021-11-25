import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class TaskLabels extends BaseSchema {
  protected tableName = 'task_labels';

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('task_id').unsigned().references('id').inTable('tasks');
      table.integer('label_id').unsigned().references('id').inTable('labels');
			table.primary(['task_id', 'label_id']);
			table.timestamps(true);
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName);
  }
}
