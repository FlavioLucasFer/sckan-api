import { 
	BaseModel, 
	BelongsTo, 
	belongsTo, column, 
} from '@ioc:Adonis/Lucid/Orm';
import { DateTime } from 'luxon';

import Label from 'App/Models/Label';
import Task from 'App/Models/Task';

import Serialize from 'App/Helpers/Serialize';

export default class TaskLabel extends BaseModel {
  @column({ 
		isPrimary: true,
		serializeAs: 'taskId', 
	})
  public taskId: number;
	
  @column({ 
		isPrimary: true,
		serializeAs: 'labelId', 
	})
	public labelId: number;

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

	@belongsTo(() => Task)
	public task: BelongsTo<typeof Task>;

	@belongsTo(() => Label)
	public label: BelongsTo<typeof Label>;
}
