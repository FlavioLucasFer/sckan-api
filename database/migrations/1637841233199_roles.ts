import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Roles extends BaseSchema {
  protected tableName = 'roles'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 50).primary()
			table.string('name', 255).unique().notNullable()
      table.timestamps(true)
			table.timestamp('deleted_at')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
