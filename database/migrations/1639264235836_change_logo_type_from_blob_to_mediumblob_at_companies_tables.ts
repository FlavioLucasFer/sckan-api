import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Companies extends BaseSchema {
  protected tableName = 'companies';

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
			table.specificType('logo', 'mediumblob').alter();
		});
  }
	
  public async down () {
		this.schema.alterTable(this.tableName, (table) => {
			table.specificType('logo', 'blob').alter();
    });
  }
}
