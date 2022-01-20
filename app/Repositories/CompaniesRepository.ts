import { ModelObject } from "@ioc:Adonis/Lucid/Orm";

import Company from "App/Models/Company";

export type PersistCompanyFields = {
	name: string,
	tradeName?: string,
	email: string,
};

export type UpdateCompanyFields = {
	id: number,
	name?: string,
	tradeName?: string,
	email?: string,
};

export type FindOrFailQueryParams = {
	columns?: string[],
	trashed?: boolean,
	trashedOnly?: boolean,
	withLogo?: boolean,
	preloadUsers?: boolean,
	preloadProjects?: boolean,
	preloadLabels?: boolean,
	preloadStatuses?: boolean,
	preloadPriorities?: boolean,
};

export type AllQueryParams = FindOrFailQueryParams & {
	name?: string,
	tradeName?: string,
	email?: string,
	limit?: number,
	page?: number,
	pageLimit?: number,
};

interface CompaniesRepositoryInterface {
	persist(fields: PersistCompanyFields): Promise<Company>;
	update(fields: UpdateCompanyFields): Promise<Company>;
	logo(id: number, logo: Buffer | null): Promise<Company>;
	delete(id: number): Promise<boolean>;
	restore(id: number): Promise<boolean>;
	all(params?: AllQueryParams): Promise<Company[] | { meta: any; data: ModelObject[]; }>;
	findOrFail(id: number, params?: FindOrFailQueryParams): Promise<Company>;
};

export default class CompaniesRepository implements CompaniesRepositoryInterface {
	private columns: string[];

	public constructor() {
		const columns = Array.from(Company.$columnsDefinitions, ([key]) => key);
		columns.splice(columns.indexOf('deletedAt'), 1);
		columns.splice(columns.indexOf('logo'), 1);

		this.columns = columns;
	}
	
	public async persist(fields: PersistCompanyFields): Promise<Company> {
		try {
			return await Company.create(fields);
		} catch (err) {
			throw err;
		}
	}

	public async update(fields: UpdateCompanyFields): Promise<Company> {
		const {
			id,
			name,
			tradeName,
			email,
		} = fields;
		let company: Company;

		try {
			company = await this.findOrFail(id);
		} catch (err) {
			throw err;
		}

		if (name)
			company.name = name;

		if (tradeName)
			company.tradeName = tradeName;

		if (email)
			company.email = email;

		try {
			await company.save();

			return await company.refresh();
		} catch (err) {
			throw err;
		}
	}

	public async logo(id: number, logo: Buffer | null): Promise<Company> {
		let company: Company;

		try {
			company = await this.findOrFail(id);
		} catch (err) {
			throw err;
		}

		company.logo = logo;

		try {
			await company.save();
		} catch (err) {
			throw err;
		}

		return await company.refresh();
	}

	public async delete(id: number): Promise<boolean> {
		let company: Company;

		try {
			company = await this.findOrFail(id);
		} catch (err) {
			throw err;
		}

		try {
			await company.softDelete();

			return true;
		} catch (err) {
			throw err;
		}
	}

	public async restore(id: number): Promise<boolean> {
		let company: Company;

		try {
			company = await this.findOrFail(id, { trashedOnly: true });
		} catch (err) {
			throw err;
		}

		try {
			await company.restore();

			return true;
		} catch (err) {
			throw err;
		}
	}

	public async all(params?: AllQueryParams): Promise<Company[] | { meta: any; data: ModelObject[]; }> {
		const query = Company.query()
			.select(params?.columns || this.columns);

		if (params) {
			const {
				name,
				tradeName,
				email,
				trashed = false,
				trashedOnly = false,
				withLogo = false,
				preloadUsers = false,
				preloadProjects = false,
				preloadLabels = false,
				preloadStatuses = false,
				preloadPriorities = false,
				limit,
			} = params;

			if (withLogo)
				query.select('logo');

			if (trashed && !trashedOnly)
				query.withTrashed();

			else if (!trashed && trashedOnly)
				query.onlyTrashed();

			if (name)
				query.where('name', 'LIKE', `%${name}%`);

			if (tradeName)
				query.where('tradeName', 'LIKE', `%${tradeName}%`);

			if (email)
				query.where('email', 'LIKE', `%${email}%`);

			if (preloadUsers)
				query.preload('users');

			if (preloadProjects)
				query.preload('projects');

			if (preloadLabels)
				query.preload('labels');

			if (preloadStatuses)
				query.preload('statuses');

			if (preloadPriorities)
				query.preload('priorities');

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

	public async findOrFail(id: number, params?: FindOrFailQueryParams): Promise<Company> {
		let recordNotFoundMessage = 'Company not found';

		const query = Company.query()
			.select(params?.columns || this.columns)
			.where('id', id);

		if (params) {
			const {
				trashed = false,
				trashedOnly = false,
				withLogo = false,
				preloadUsers = false,
				preloadProjects = false,
				preloadLabels = false,
				preloadStatuses = false,
				preloadPriorities = false,
			} = params;

			if (withLogo)
				query.select('logo');

			if (trashed && !trashedOnly)
				query.withTrashed();

			else if (!trashed && trashedOnly) {
				query.onlyTrashed();
				recordNotFoundMessage = 'No deleted company found';
			}

			if (preloadUsers)
				query.preload('users');

			if (preloadProjects)
				query.preload('projects');

			if (preloadLabels)
				query.preload('labels');

			if (preloadStatuses)
				query.preload('statuses');

			if (preloadPriorities)
				query.preload('priorities');
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