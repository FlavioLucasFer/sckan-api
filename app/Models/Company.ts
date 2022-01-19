import { 
	column, 
	HasMany, 
	hasMany, 
} from '@ioc:Adonis/Lucid/Orm';
import { DateTime } from 'luxon';

import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import Priority from 'App/Models/Priority';
import Project from 'App/Models/Project';
import Status from 'App/Models/Status';
import Label from 'App/Models/Label';
import User from 'App/Models/User';

import Serialize from 'App/Helpers/Serialize';

export default class Company extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

	@column()
	public name: string;

	@column({ serializeAs: 'tradeName' })
	public tradeName: string | null;

	@column()
	public email: string;

	@column()
	public logo: Buffer | null;

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

	@hasMany(() => Project, {
		onQuery: query => {
			query.select([
				'id',
				'name',
				'description',
				'contractorName',
				'cloneUrl',
				'companyId',
				'responsibleId',
				'createdAt',
				'updatedAt',
			]);
		},
	})
	public projects: HasMany<typeof Project>;

	@hasMany(() => Label)
	public labels: HasMany<typeof Label>;

	@hasMany(() => Status)
	public statuses: HasMany<typeof Status>;

	@hasMany(() => Priority)
	public priorities: HasMany<typeof Priority>;
}
