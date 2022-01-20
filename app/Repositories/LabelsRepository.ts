import { ModelObject } from "@ioc:Adonis/Lucid/Orm";

import Label from "App/Models/Label";

export type PersistLabelsFields = {
	name: string,
	description?: string,
	color: string,
	company: number,
};

export type UpdateLabelsFields = {
	id: number,
	name?: string,
	description?: string,
	color?: string,
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
	description?: string,
	color?: string,
	company?: number,
	limit?: number,
	page?: number,
	pageLimit?: number,
};

interface LabelsRepositoryInterface {
	persist(fields: PersistLabelsFields): Promise<Label>;
	update(fields: UpdateLabelsFields): Promise<Label>;
	delete(id: number): Promise<boolean>;
	restore(id: number): Promise<boolean>;
	all(params?: AllQueryParams): Promise<Label[] | { meta: any; data: ModelObject[]; }>;
	findOrFail(id: number, params?: FindOrFailQueryParams): Promise<Label>;
};

export default class LabelsRepository implements LabelsRepositoryInterface {
	private columns: string[];

	public constructor() {
		const columns = Array.from(Label.$columnsDefinitions, ([key]) => key);
		columns.splice(columns.indexOf('deletedAt'), 1);

		this.columns = columns;
	}

	public async persist(fields: PersistLabelsFields): Promise<Label> {
		const {
			company,
		} = fields;

		try {
			return await Label.create({
				...fields,
				companyId: company,
			});
		} catch (err) {
			throw err;
		}
	}

	public async update(fields: UpdateLabelsFields): Promise<Label> {
		const {
			id,
			name,
			description,
			color,
			company,
		} = fields;
		let label: Label;

		try {
			label = await this.findOrFail(id);
		} catch (err) {
			throw err;
		}

		if (name)
			label.name = name;

		if (description)
			label.description = description;

		if (color)
			label.color = color;

		if (company)
			label.companyId = company;

		try {
			await label.save();

			return await label.refresh();
		} catch (err) {
			throw err;
		}
	}

	public async delete(id: number): Promise<boolean> {
		let label: Label;

		try {
			label = await this.findOrFail(id);
		} catch (err) {
			throw err;
		}

		try {
			await label.softDelete();

			return true;
		} catch (err) {
			throw err;
		}
	}

	public async restore(id: number): Promise<boolean> {
		let label: Label;

		try {
			label = await this.findOrFail(id, { trashedOnly: true });
		} catch (err) {
			throw err;
		}

		try {
			await label.restore();

			return true;
		} catch (err) {
			throw err;
		}
	}

	public async all(params?: AllQueryParams): Promise<Label[] | { meta: any; data: ModelObject[]; }> {
		const query = Label.query()
			.select(params?.columns || this.columns)

		if (params) {
			const {
				name,
				description,
				color,
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
				query.where('name', 'LIKE', `%${name}%`)

			if (description)
				query.where('description', 'LIKE', `%${description}%`);

			if (color)
				query.where('color', color);

			if (company)
				query.where('companyId', company)

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

	public async findOrFail(id: number, params?: FindOrFailQueryParams): Promise<Label> {
		let recordNotFoundMessage = 'Label not found';

		const query = Label.query()
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
				recordNotFoundMessage = 'No deleted label found';
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