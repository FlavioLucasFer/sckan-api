import Hash from '@ioc:Adonis/Core/Hash';
import {  
	beforeSave, 
	belongsTo, 
	BelongsTo, 
	column, 
	HasMany, 
	hasMany, 
} from '@ioc:Adonis/Lucid/Orm';
import { DateTime } from 'luxon';

import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import Company from 'App/Models/Company';
import Project from 'App/Models/Project';
import Role from 'App/Models/Role';
import Task from 'App/Models/Task';

import Serialize from 'App/Helpers/Serialize';

export default class User extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

	@column()
	public name: string;

	@column()
	public username: string;

	@column()
	public email: string;

	@column({ serializeAs: null })
	public password: string;
	
	@column()
	public picture: Buffer | null;

	@column({ serializeAs: 'companyId' })
	public companyId: number;

	@column({ serializeAs: 'roleId' })
	public roleId: string;

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

	@belongsTo(() => Company, { 
		onQuery: query => {
			query.select([
				'id',
				'name',
				'tradeName',
				'email',
				'createdAt',
				'updatedAt',
			]);
		},
	})
	public company: BelongsTo<typeof Company>;

	@belongsTo(() => Role)
	public role: BelongsTo<typeof Role>;

	@hasMany(() => Project, { 
		foreignKey: 'responsibleId',
		onQuery: query => {
			query.select([
				'id',
				'companyId',
				'responsibleId',
				'name',
				'description',
				'contractorName',
				'cloneUrl',
				'createdAt',
				'updatedAt',
			]);
		},
	})
	public projects: HasMany<typeof Project>;

	@hasMany(() => Task)
	public tasks: HasMany<typeof Task>;

	@beforeSave()
	public static async hashPassword(user: User) {
		if (user.$dirty.password) 
			user.password = await Hash.make(user.password);
	}
}
