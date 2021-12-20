import Hash from '@ioc:Adonis/Core/Hash';
import { DateTime } from 'luxon';
import {  
	beforeSave, 
	belongsTo, 
	BelongsTo, 
	column, 
	HasOne, 
	hasOne, 
	LucidModel, 
	ModelAdapterOptions, 
} from '@ioc:Adonis/Lucid/Orm';

import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import Serialize from 'App/Helpers/Serialize';
import Company from 'App/Models/Company';
import Role from 'App/Models/Role';

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

	@belongsTo(() => Company, { foreignKey: 'company_id' })
	public company: BelongsTo<typeof Company>;

	@hasOne(() => Role, { foreignKey: 'role_id' })
	public role: HasOne<typeof Role>;

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
