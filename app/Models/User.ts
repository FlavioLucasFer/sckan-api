import Hash from '@ioc:Adonis/Core/Hash';
import {  
	beforeSave, 
	belongsTo, 
	BelongsTo, 
	column, 
	HasMany, 
	hasMany, 
	LucidModel, 
	ModelAdapterOptions, 
} from '@ioc:Adonis/Lucid/Orm';
import { DateTime } from 'luxon';

import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import Company from 'App/Models/Company';
import Project from 'App/Models/Project';
import Role from 'App/Models/Role';

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

	@belongsTo(() => Company, { foreignKey: 'companyId' })
	public company: BelongsTo<typeof Company>;

	@belongsTo(() => Role, { foreignKey: 'roleId' })
	public role: BelongsTo<typeof Role>;

	@hasMany(() => Project, { foreignKey: 'responsibleId' })
	public projects: HasMany<typeof Project>;

	@beforeSave()
	public static async hashPassword(user: User) {
		if (user.$dirty.password) 
			user.password = await Hash.make(user.password);
	}

	static async customAll<T extends LucidModel>(
		this: T, 
		withPicture: boolean = false, 
		options?: ModelAdapterOptions,
	): Promise<InstanceType<T>[]> {
		const query = this.query(options)
			.select([
				'id',
				'companyId',
				'roleId',
				'name',
				'username',
				'email',
				'password',
				'createdAt',
				'updatedAt',
			]);
			

		if (withPicture)
			query.select('picture');

		return await query;
	}

	static async customFindOrFail<T extends LucidModel>(
		this: T, 
		value: any, 
		withPicture: boolean = false, 
		options?: ModelAdapterOptions
	): Promise<InstanceType<T>> {
		const query = this.query(options)
			.select([
				'id',
				'companyId',
				'roleId',
				'name',
				'username',
				'email',
				'password',
				'createdAt',
				'updatedAt',
			])
			.where('id', value);

		if (withPicture)
			query.select('picture');

		return await query.firstOrFail();
	}
}
