import { DateTime } from 'luxon';
import { 
	BelongsTo, 
	belongsTo, 
	column, 
	HasMany, 
	hasMany, 
	HasOne, 
	hasOne, 
	LucidModel, 
	ModelAdapterOptions, 
} from '@ioc:Adonis/Lucid/Orm';

import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import Serialize from 'App/Helpers/Serialize';
import Company from 'App/Models/Company';
import Sprint from 'App/Models/Sprint';
import User from 'App/Models/User';

export default class Project extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

	@column()
	public name: string;

	@column()
	public description: string;

	@column({ serializeAs: 'contractorName' })
	public contractorName: string;

	@column({ serializeAs: 'cloneUrl' })
	public cloneUrl: string;

	@column()
	public logo: Blob | null;

	@column({ serializeAs: 'companyId' })
	public companyId: number;

	@column({ serializeAs: 'responsibleId' })
	public responsibleId: number;

  @column.dateTime({ 
		autoCreate: true, 
		serializeAs: 'createdAt',
		serialize: (value: DateTime | null) => Serialize.formatTimestamp(value),
	})
  public createdAt: DateTime;
	
  @column.dateTime({ 
		autoCreate: true, 
		autoUpdate: true, 
		serializeAs: 'updatedAt',
		serialize: (value: DateTime | null) => Serialize.formatTimestamp(value),
	})
  public updatedAt: DateTime;

	@column.dateTime({ serializeAs: null })
	public deletedAt: DateTime;

	@belongsTo(() => Company, { foreignKey: 'companyId' })
	public company: BelongsTo<typeof Company>;

	@hasOne(() => User, { foreignKey: 'responsibleId' })
	public responsible: HasOne<typeof User>;

	@hasMany(() => Sprint, { foreignKey: 'projectId' })
	public sprints: HasMany<typeof Sprint>;

	static async customAll<T extends LucidModel>(
		this: T,
		withLogo: boolean = false,
		options?: ModelAdapterOptions,
	): Promise<InstanceType<T>[]> {
		const query = this.query(options)
			.select([
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


		if (withLogo)
			query.select('logo');

		return await query;
	}

	static async customFindOrFail<T extends LucidModel>(
		this: T,
		value: any,
		withLogo: boolean = false,
		options?: ModelAdapterOptions
	): Promise<InstanceType<T>> {
		const query = this.query(options)
			.select([
				'id',
				'companyId',
				'responsibleId',
				'name',
				'description',
				'contractorName',
				'cloneUrl',
				'createdAt',
				'updatedAt',
			])
			.where('id', value);

		if (withLogo)
			query.select('logo');

		return await query.firstOrFail();
	}
}
