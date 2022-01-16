import { 
	BelongsTo, 
	belongsTo, 
	column, 
} from '@ioc:Adonis/Lucid/Orm';
import { DateTime } from 'luxon';

import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import Company from 'App/Models/Company';

import Serialize from 'App/Helpers/Serialize';

export default class Priority extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

	@column()
	public name: string;
	
	@column({ serialize: (value: string) => `#${value}` })
	public color: string;

	@column()
	public level: number;

	@column({ serializeAs: 'companyId' })
	public companyId: number;

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
}
