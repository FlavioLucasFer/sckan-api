import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class Labels extends BaseSchema {
  protected tableName = 'labels';

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
			table.dropUnique(['name']);
    });
  };

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
			table.unique(['name']);
    });
  };
}
