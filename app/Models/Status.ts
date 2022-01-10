import { 
	belongsTo,
	BelongsTo,
	column,
	HasOne,
	hasOne, 
} from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import Company from 'App/Models/Company';

import Serialize from 'App/Helpers/Serialize';

export default class Status extends SoftDeleteBaseModel {
	@column({ isPrimary: true })
	public id: number;
	
	@column()
	public name: string;

	@column({ serializeAs: 'previousStatusId' })
	public previousStatusId: number;

	@column({ serializeAs: 'nextStatusId' })
	public nextStatusId: number;

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

	@hasOne(() => Status, { foreignKey: 'previousStatusId' })
	public previousStatus: HasOne<typeof Status>;

	@hasOne(() => Status, { foreignKey: 'nextStatusId' })
	public nextStatus: HasOne<typeof Status>;
}
