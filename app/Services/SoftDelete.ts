import { DateTime } from 'luxon';
import { BaseModel, LucidRow, ModelQueryBuilderContract } from '@ioc:Adonis/Lucid/Orm';

export const softDeleteQuery = (query: ModelQueryBuilderContract<typeof BaseModel>) => {
	if (!query.toSQL().sql.includes('deleted_at'))
		query.whereNull('deleted_at');
}

export const softDelete = async (row: LucidRow, column: string = 'deletedAt') => {
	if (column in row.$attributes) {
		row[column] = DateTime.local();
		
		await row.save();
	}
}

export const restore = async (row: LucidRow, column: string = 'deletedAt') => {
	if (column in row.$attributes) {
		row[column] = null;

		await row.save();
	}
}