import { ModelObject } from "@ioc:Adonis/Lucid/Orm";

import Priority from "App/Models/Priority";

export type PersistPrioritiesFields = {
	name: string,
	color: string,
	level: number,
	company: number,
};

export type UpdatePrioritiesFields = {
	id: number,
	name?: string,
	color?: string,
	level?: number,
	company?: number,
};

export type FindOrFailQueryParams = {
	columns?: string[],
	trashed?: boolean,
	trashedOnly?: boolean,
	preloadCompany?: boolean,
	preloadTasks?: boolean,
};

export type AllQueryParams = FindOrFailQueryParams & {
	name?: string,
	color?: string,
	level?: number,
	company?: number,
	limit?: number,
	page?: number,
	pageLimit?: number,
};

interface PrioritiesRepositoryInterface {
	persist(fields: PersistPrioritiesFields): Promise<Priority>;
	update(fields: UpdatePrioritiesFields): Promise<Priority>;
	delete(id: number): Promise<boolean>;
	restore(id: number): Promise<boolean>;
	all(params?: AllQueryParams): Promise<Priority[] | { meta: any; data: ModelObject[]; }>;
	findOrFail(id: number, params?: FindOrFailQueryParams): Promise<Priority>;
};

export default class PrioritiesRepository implements PrioritiesRepositoryInterface {
	private columns: string[];

	public constructor() {
		const columns = Array.from(Priority.$columnsDefinitions, ([key]) => key);
		columns.splice(columns.indexOf('deletedAt'), 1);

		this.columns = columns;
	}

	public async persist(fields: PersistPrioritiesFields): Promise<Priority> {
		const {
			company,
		} = fields;

		try {
			return await Priority.create({
				...fields,
				companyId: company,
			});
		} catch (err) {
			throw err;
		}
	}

	public async update(fields: UpdatePrioritiesFields): Promise<Priority> {
		const {
			id,
			name,
			color,
			level,
			company,
		} = fields;
		let priority: Priority;

		try {
			priority = await this.findOrFail(id);
		} catch (err) {
			throw err;
		}

		if (name)
			priority.name = name;

		if (color)
			priority.color = color;

		if (level)
			priority.level = level;

		if (company)
			priority.companyId = company;

		try {
			await priority.save();

			return await priority.refresh();
		} catch (err) {
			throw err;
		}
	}

	public async delete(id: number): Promise<boolean> {
		let priority: Priority;

		try {
			priority = await this.findOrFail(id);
		} catch (err) {
			throw err;
		}

		try {
			await priority.softDelete();

			return true;
		} catch (err) {
			throw err;
		}
	}

	public async restore(id: number): Promise<boolean> {
		let priority: Priority;

		try {
			priority = await this.findOrFail(id, { trashedOnly: true });
		} catch (err) {
			throw err;
		}

		try {
			await priority.restore();

			return true;
		} catch (err) {
			throw err;
		}
	}

	public async all(params?: AllQueryParams): Promise<Priority[] | { meta: any; data: ModelObject[]; }> {
		const query = Priority.query()
			.select(params?.columns || this.columns)
			.orderBy('level', 'desc')
			.orderBy('name', 'asc');

		if (params) {
			const {
				name,
				color,
				level,
				company,
				trashed = false,
				trashedOnly = false,
				preloadCompany = false,
				preloadTasks = false,
				limit,
			} = params;

			if (trashed && !trashedOnly)
				query.withTrashed();

			else if (!trashed && trashedOnly)
				query.onlyTrashed();

			if (name)
				query.where('name', 'LIKE', `%${name}%`);

			if (color)
				query.where('color', color);

			if (level)
				query.where('level', level);

			if (company)
				query.where('companyId', company);

			if (preloadCompany)
				query.preload('company');

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

	public async findOrFail(id: number, params?: FindOrFailQueryParams): Promise<Priority> {
		let recordNotFoundMessage = 'Priority not found';

		const query = Priority.query()
			.select(params?.columns || this.columns)
			.where('id', id);

		if (params) {
			const {
				trashed = false,
				trashedOnly = false,
				preloadCompany = false,
				preloadTasks = false,
			} = params;

			if (trashed && !trashedOnly)
				query.withTrashed();

			else if (!trashed && trashedOnly) {
				query.onlyTrashed();
				recordNotFoundMessage = 'No deleted priority found';
			}

			if (preloadCompany)
				query.preload('company');

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