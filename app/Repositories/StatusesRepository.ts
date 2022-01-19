import { ModelObject } from "@ioc:Adonis/Lucid/Orm";

import Status from "App/Models/Status";

export type PersistStatusesFields = {
	name: string,
	previousStatus?: number,
	nextStatus?: number,
	company: number,
};

export type UpdateStatusesFields = {
	id: number,
	name?: string,
	previousStatus?: number,
	nextStatus?: number,
	company?: number,
};

export type FindOrFailQueryParams = {
	columns?: string[],
	trashed?: boolean,
	trashedOnly?: boolean,
	preloadCompany?: boolean,
	preloadPreviousStatus?: boolean,
	preloadNextStatus?: boolean,
	preloadTasks?: boolean,
};

export type AllQueryParams = FindOrFailQueryParams & {
	name?: string,
	previousStatus?: number,
	nextStatus?: number,
	company?: number,
	limit?: number,
	page?: number,
	pageLimit?: number,
};

interface StatusesRepositoryInterface {
	persist(fields: PersistStatusesFields): Promise<Status>;
	update(fields: UpdateStatusesFields): Promise<Status>;
	delete(id: number): Promise<boolean>;
	restore(id: number): Promise<boolean>;
	all(params?: AllQueryParams): Promise<Status[] | { meta: any; data: ModelObject[]; }>;
	findOrFail(id: number, params?: FindOrFailQueryParams): Promise<Status>;
};

export default class StatusesRepository implements StatusesRepositoryInterface {
	private columns: string[];

	public constructor() {
		const columns = Array.from(Status.$columnsDefinitions, ([key]) => key);
		columns.splice(columns.indexOf('deletedAt'), 1);

		this.columns = columns;
	}

	public async persist(fields: PersistStatusesFields): Promise<Status> {
		const {
			name,
			previousStatus,
			nextStatus,
			company,
		} = fields;

		try {
			return await Status.create({
				name,
				previousStatusId: previousStatus,
				nextStatusId: nextStatus,
				companyId: company,
			});
		} catch (err) {
			throw err;
		}
	}

	public async update(fields: UpdateStatusesFields): Promise<Status> {
		const {
			id,
			name,
			previousStatus,
			nextStatus,
			company,
		} = fields;
		let status: Status;

		try {
			status = await this.findOrFail(id);
		} catch (err) {
			throw err;
		}

		if (name)
			status.name = name;

		if (previousStatus)
			status.previousStatusId = previousStatus;

		if (nextStatus)
			status.nextStatusId = nextStatus;

		if (company)
			status.companyId = company;

		try {
			await status.save();

			return await status.refresh();
		} catch (err) {
			throw err;
		}
	}

	public async delete(id: number): Promise<boolean> {
		let status: Status;

		try {
			status = await this.findOrFail(id);
		} catch (err) {
			throw err;
		}

		try {
			await status.softDelete();

			return true;
		} catch (err) {
			throw err;
		}
	}

	public async restore(id: number): Promise<boolean> {
		let status: Status;

		try {
			status = await this.findOrFail(id, { trashedOnly: true });
		} catch (err) {
			throw err;
		}

		try {
			await status.restore();

			return true;
		} catch (err) {
			throw err;
		}
	}

	public async all(params?: AllQueryParams): Promise<Status[] | { meta: any; data: ModelObject[]; }> {
		const query = Status.query()
			.select(params?.columns || this.columns)

		if (params) {
			const {
				name,
				previousStatus,
				nextStatus,
				company,
				trashed = false,
				trashedOnly = false,
				preloadCompany = false,
				preloadPreviousStatus = false,
				preloadNextStatus = false,
				preloadTasks = false,
				limit,
			} = params;

			if (trashed && !trashedOnly)
				query.withTrashed();

			else if (!trashed && trashedOnly)
				query.onlyTrashed();

			if (name)
				query.where('name', 'LIKE', `%${name}%`)

			if (previousStatus)
				query.where('previousStatusId', previousStatus)

			if (nextStatus)
				query.where('nextStatusId', nextStatus)

			if (company)
				query.where('companyId', company)

			if (preloadCompany)
				query.preload('company');

			if (preloadPreviousStatus)
				query.preload('previousStatus');

			if (preloadNextStatus)
				query.preload('nextStatus');

			if (preloadTasks)
				query.preload('tasks');

			if (limit)
				query.limit(limit);
		}

		try {
			if (params?.page)
				return (await query.paginate(params.page, params.pageLimit || 10)).toJSON();

			return await query;
		} catch (err) {
			throw err;
		}
	}

	public async findOrFail(id: number, params?: FindOrFailQueryParams): Promise<Status> {
		let recordNotFoundMessage = 'Status not found';

		const query = Status.query()
			.select(params?.columns || this.columns)
			.where('id', id);

		if (params) {
			const {
				trashed = false,
				trashedOnly = false,
				preloadCompany = false,
				preloadPreviousStatus = false,
				preloadNextStatus = false,
				preloadTasks = false,
			} = params;

			if (trashed && !trashedOnly)
				query.withTrashed();

			else if (!trashed && trashedOnly) {
				query.onlyTrashed();
				recordNotFoundMessage = 'No deleted status found';
			}

			if (preloadCompany)
				query.preload('company');

			if (preloadPreviousStatus)
				query.preload('previousStatus');

			if (preloadNextStatus)
				query.preload('nextStatus');

			if (preloadTasks)
				query.preload('tasks');
		}

		try {
			return await query.firstOrFail();
		} catch (err) {
			if (err.code === 'E_ROW_NOT_FOUND')
				throw {
					code: err.code,
					message: recordNotFoundMessage,
				};

			throw err;
		}
	}
};