import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class Priorities extends BaseSchema {
  protected tableName = 'priorities';

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
			table.integer('level').unsigned().notNullable().alter();
    });
  };
	
  public async down () {
		this.schema.alterTable(this.tableName, (table) => {
			table.integer('level').notNullable().alter();
    });
  };
}
