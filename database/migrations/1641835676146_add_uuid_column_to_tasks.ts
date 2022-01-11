import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class Tasks extends BaseSchema {
  protected tableName = 'tasks';

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
			table.specificType('uuid', 'char(5)').unique().notNullable().after('id');
		});
  };

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
			table.dropColumn('uuid');
    });
  };
}
