import { DateTime } from 'luxon';
import { BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm';

import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import Project from 'App/Models/Project';
import Task from 'App/Models/Task';

import Serialize from 'App/Helpers/Serialize';

export default class Sprint extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

	@column()
	public name: string;

	@column()
	public description: string;

	@column({ 
		serializeAs: 'startsAt', 
		serialize: (value: DateTime | null) => Serialize.formatTimestamp(value),
	})
	public startsAt: DateTime;

	@column({ 
		serializeAs: 'endsAt', 
		serialize: (value: DateTime | null) => Serialize.formatTimestamp(value),
	})
	public endsAt: DateTime;

	@column({ 
		serializeAs: 'startedAt',
		serialize: (value: DateTime | null) => Serialize.formatTimestamp(value),
	})
	public startedAt: DateTime;

	@column({ 
		serializeAs: 'endedAt', 
		serialize: (value: DateTime | null) => Serialize.formatTimestamp(value),
	})
	public endedAt: DateTime;

	@column({ serializeAs: 'projectId' })
	public projectId: number;

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

	@belongsTo(() => Project, {
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
	public project: BelongsTo<typeof Project>;

	@hasMany(() => Task)
	public tasks: HasMany<typeof Task>;
}
