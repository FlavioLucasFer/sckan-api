import { 
	beforeSave, 
	column, 
	HasMany, 
	hasMany,
} from '@ioc:Adonis/Lucid/Orm';
import { string } from '@ioc:Adonis/Core/Helpers';
import { DateTime } from 'luxon';

import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import User from 'App/Models/User';

import Serialize from 'App/Helpers/Serialize';

export default class Role extends SoftDeleteBaseModel {
	public static selfAssignPrimaryKey = true;
	
	@column({ isPrimary: true })
  public id: string;

	@column()
	public name: string;

  @column.dateTime({ 
		serializeAs: 'createdAt',
		autoCreate: true, 
		serialize: (value: DateTime | null) => Serialize.formatTimestamp(value),
	})
  public createdAt: DateTime;

	@column.dateTime({ 
		serializeAs: 'updatedAt',
		autoCreate: true, 
		autoUpdate: true, 
		serialize: (value: DateTime | null) => Serialize.formatTimestamp(value),
	})
  public updatedAt: DateTime;

	@column.dateTime({ serializeAs: null })
	public deletedAt: DateTime;

	@hasMany(() => User, { 
		onQuery: query => {
			query.select([
				'id',
				'name',
				'username',
				'email',
				'companyId',
				'roleId',
				'createdAt',
				'updatedAt',
			]);
		}, 
	})
	public users: HasMany<typeof User>;

	@beforeSave()
	public static assignSlug(role: Role) {
		role.id = string.dashCase(role.id.normalize('NFD').trim().toLowerCase().replace(/[\u0300-\u036f]/g, ""));
	}
}
