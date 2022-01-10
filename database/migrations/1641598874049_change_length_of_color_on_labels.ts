import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class Labels extends BaseSchema {
  protected tableName = 'labels';

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
			table.string('color', 6).notNullable().alter();
    });
  };
	
  public async down () {
		this.schema.alterTable(this.tableName, (table) => {
			table.string('color', 7).notNullable().alter();
    });
  };
}
