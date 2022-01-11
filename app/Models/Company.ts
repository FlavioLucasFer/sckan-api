import { 
	column, 
	HasMany, 
	hasMany, 
	LucidModel, 
	ModelAdapterOptions,
} from '@ioc:Adonis/Lucid/Orm';
import { DateTime } from 'luxon';

import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import Priority from 'App/Models/Priority';
import Project from 'App/Models/Project';
import Status from 'App/Models/Status';
import Label from 'App/Models/Label';

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

	@hasMany(() => Project, { foreignKey: 'companyId' })
	public projects: HasMany<typeof Project>;

	@hasMany(() => Label, { foreignKey: 'companyId' })
	public labels: HasMany<typeof Label>;

	@hasMany(() => Priority, { foreignKey: 'companyId' })
	public priorities: HasMany<typeof Priority>;

	@hasMany(() => Status, { foreignKey: 'companyId' })
	public statuses: HasMany<typeof Status>;

	static async customAll<T extends LucidModel>(this: T, withLogo: boolean = false, options?: ModelAdapterOptions): Promise<InstanceType<T>[]> {
		const query = this.query(options)
			.select([
				'id',
				'name',
				'tradeName',
				'email',
				'createdAt',
				'updatedAt',
			]);

		if (withLogo)
			query.select('logo');

		return await query;
	}

	static async customFindOrFail<T extends LucidModel>(this: T, value: any, withLogo: boolean = false, options?: ModelAdapterOptions): Promise<InstanceType<T>> {
		const query = this.query(options)
			.select([
				'id',
				'name',
				'tradeName',
				'email',
				'createdAt',
				'updatedAt',
			])
			.where('id', value);

		if (withLogo)
			query.select('logo');

		return await query.firstOrFail();
	}
}
