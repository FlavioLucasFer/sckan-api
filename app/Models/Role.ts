import { DateTime } from 'luxon';
import { string } from '@ioc:Adonis/Core/Helpers';
import { beforeSave, column } from '@ioc:Adonis/Lucid/Orm';

import Serialize from 'App/Helpers/Serialize';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';

export default class Role extends SoftDeleteBaseModel {
 	public static selfAssignPrimaryKey = true;
	
	@column({ isPrimary: true })
  public id: string;

	@column()
	public name: string;

  @column.dateTime({ 
		autoCreate: true, 
		serialize: (value: DateTime | null) => Serialize.formatTimestamp(value),
	})
  public createdAt: DateTime;

	@column.dateTime({ 
		autoCreate: true, 
		autoUpdate: true, 
		serialize: (value: DateTime | null) => Serialize.formatTimestamp(value),
	})
  public updatedAt: DateTime;

	@column.dateTime({ serializeAs: null })
	public deletedAt: DateTime;

	@beforeSave()
	public static assignSlug(role: Role) {
		role.id = string.dashCase(role.id.normalize('NFD').trim().toLowerCase().replace(/[\u0300-\u036f]/g, ""));
	}

	@beforeSave()
	public static trimName(role: Role) {
		role.name = role.name.trim();
	}
}
