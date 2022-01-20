import { DateTime } from 'luxon';
import { 
	BelongsTo, 
	belongsTo, 
	column, 
	HasMany, 
	hasMany, 
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
	public logo: Buffer | null;

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

	@belongsTo(() => User, { 
		foreignKey: 'responsibleId',
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
	public responsible: BelongsTo<typeof User>;

	@hasMany(() => Sprint)
	public sprints: HasMany<typeof Sprint>;
}
