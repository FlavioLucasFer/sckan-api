import { BaseModel, beforeFetch, beforeFind } from "@ioc:Adonis/Lucid/Orm";

import { restore, softDelete, softDeleteQuery } from "App/Services/SoftDelete";

export default class SoftDeleteBaseModel extends BaseModel {
	@beforeFind()
	public static softDeleteFind = softDeleteQuery;

	@beforeFetch()
	public static softDeleteFetch = softDeleteQuery;

	public async softDelete(column?: string) {
		await softDelete(this, column);
	}

	public async restore(column?: string) {
		await restore(this, column);
	}

	public static async allWithTrashed() {
		return await this.query()
			.withTrashed();
	}

	public static async allOnlyTrashed() {
		return await this.query()
			.onlyTrashed();
	}

	public static async findWithTrashed(id: any) {
		return await this.query()
			.where('id', id)
			.withTrashed()
			.first();
	}

	public static async findOnlyTrashed(id: any) {
		return await this.query()
			.where('id', id)
			.onlyTrashed()
			.first();
	}

	public static async findWithTrashedOrFail(id: any) {
		return await this.query()
			.andWhere('id', id)
			.withTrashed()
			.firstOrFail();
	}

	public static async findOnlyTrashedOrFail(id: any) {
		return await this.query()
			.where('id', id)
			.onlyTrashed()
			.firstOrFail();
	}
} 