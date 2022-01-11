import {  
	beforeCreate,
	BelongsTo,
	belongsTo,
	column,
} from '@ioc:Adonis/Lucid/Orm';
import { DateTime } from 'luxon';

import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import Priority from 'App/Models/Priority';
import Sprint from 'App/Models/Sprint';
import Status from 'App/Models/Status';
import User from 'App/Models/User';

import Serialize from 'App/Helpers/Serialize';
import uuid from 'App/Helpers/uuid';

export default class Task extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column({ serialize: value => `#${value}` })
  public uuid: string;

	@column()
	public name: string;

	@column()
	public description: string;

	@column({ serializeAs: 'plannedSize' })
	public plannedSize: number;

	@column()
	public size: number;

	@column({ serializeAs: 'timeSpent' })
	public timeSpent: DateTime;

	@column({ serializeAs: 'issueUrl' })
	public issueUrl: string;

	@column({ serializeAs: 'userId' })
	public userId: number;

	@column({ serializeAs: 'sprintId' })
	public sprintId: number;

	@column({ serializeAs: 'statusId' })
	public statusId: number;

	@column({ serializeAs: 'priorityId' })
	public priorityId: number;

	@column.dateTime({
		serializeAs: 'archivedAt',
		serialize: (value: DateTime | null) => Serialize.formatTimestamp(value),
	})
	public archivedAt: DateTime | null;

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

	@belongsTo(() => User)
	public user: BelongsTo<typeof User>;

	@belongsTo(() => Sprint)
	public sprint: BelongsTo<typeof Sprint>;

	@belongsTo(() => Status)
	public status: BelongsTo<typeof Status>;

	@belongsTo(() => Priority)
	public priority: BelongsTo<typeof Priority>;

	@beforeCreate()
	public static async taskUuid(task: Task) {
		while(true) {
			const taskUuid = uuid(5);

			const t = await Task.findBy('uuid', taskUuid);

			if (!t) {
				task.uuid = taskUuid;
				break;
			}
		}
	}
}
