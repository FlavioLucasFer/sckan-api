import { ModelObject } from "@ioc:Adonis/Lucid/Orm";

import Project from "App/Models/Project";

export type PersistProjectFields = {
	name: string,
	description?: string,
	contractorName?: string,
	cloneUrl?: string,
	company: number,
	responsible: number,
};

export type UpdateProjectFields = {
	id: number,
	name?: string,
	description?: string,
	contractorName?: string,
	cloneUrl?: string,
	company?: number,
	responsible?: number,
};

export type FindOrFailQueryParams = {
	columns?: string[],
	trashed?: boolean,
	trashedOnly?: boolean,
	withLogo?: boolean,
	preloadCompany?: boolean,
	preloadResponsible?: boolean,
	preloadSprints?: boolean,
};

export type AllQueryParams = FindOrFailQueryParams & {
	name?: string,
	description?: string,
	contractor?: string,
	cloneUrl?: string,
	company?: number,
	responsible?: number,
	limit?: number,
	page?: number,
	pageLimit?: number,
};

interface ProjectsRepositoryInterface {
	persist(fields: PersistProjectFields): Promise<Project>;
	update(fields: UpdateProjectFields): Promise<Project>;
	logo(id: number, logo: Buffer | null): Promise<Project>;
	delete(id: number): Promise<boolean>;
	restore(id: number): Promise<boolean>;
	all(params?: AllQueryParams): Promise<Project[] | { meta: any; data: ModelObject[]; }>;
	findOrFail(id: number, params?: FindOrFailQueryParams): Promise<Project>;
};

export default class ProjectsRepository implements ProjectsRepositoryInterface {
	private columns: string[];

	public constructor() {
		const columns = Array.from(Project.$columnsDefinitions, ([key]) => key);
		columns.splice(columns.indexOf('deletedAt'), 1);
		columns.splice(columns.indexOf('logo'), 1);

		this.columns = columns;
	}
	
	public async persist(fields: PersistProjectFields): Promise<Project> {
		const {
			company,
			responsible,
		} = fields;

		try {
			return await Project.create({
				...fields,
				companyId: company,
				responsibleId: responsible,
			});
		} catch (err) {
			throw err;
		}
	}

	public async update(fields: UpdateProjectFields): Promise<Project> {
		const {
			id,
			name,
			description,
			contractorName,
			cloneUrl,
			company,
			responsible,
		} = fields;
		let project: Project;

		try {
			project = await this.findOrFail(id);
		} catch (err) {
			throw err;
		}

		if (name)
			project.name = name;

		if (description)
			project.description = description;

		if (contractorName)
			project.contractorName = contractorName;

		if (cloneUrl)
			project.cloneUrl = cloneUrl;

		if (company)
			project.companyId = company;

		if (responsible)
			project.responsibleId = responsible;

		try {
			await project.save();

			return await project.refresh();
		} catch (err) {
			throw err;
		}
	}

	public async logo(id: number, logo: Buffer | null): Promise<Project> {
		let project: Project;

		try {
			project = await this.findOrFail(id);
		} catch (err) {
			throw err;
		}

		project.logo = logo;

		try {
			await project.save();
		} catch (err) {
			throw err;
		}

		return await project.refresh();
	}

	public async delete(id: number): Promise<boolean> {
		let project: Project;

		try {
			project = await this.findOrFail(id);
		} catch (err) {
			throw err;
		}

		try {
			await project.softDelete();

			return true;
		} catch (err) {
			throw err;
		}
	}

	public async restore(id: number): Promise<boolean> {
		let project: Project;

		try {
			project = await this.findOrFail(id, { trashedOnly: true });
		} catch (err) {
			throw err;
		}

		try {
			await project.restore();

			return true;
		} catch (err) {
			throw err;
		}
	}

	public async all(params?: AllQueryParams): Promise<Project[] | { meta: any; data: ModelObject[]; }> {
		const query = Project.query()
			.select(params?.columns || this.columns);

		if (params) {
			const {
				name,
				description,
				contractor,
				cloneUrl,
				company,
				responsible,
				trashed = false,
				trashedOnly = false,
				withLogo = false,
				preloadCompany = false,
				preloadResponsible = false,
				preloadSprints = false,
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

			if (description)
				query.where('description', 'LIKE', `%${description}%`);

			if (contractor)
				query.where('contractorName', 'LIKE', `%${contractor}%`);
			
			if (cloneUrl)
				query.where('cloneUrl', 'LIKE', `%${cloneUrl}%`);
			
			if (company)
				query.where('companyId', company);

			if (responsible)
				query.where('responsibleId', responsible);

			if (preloadCompany)
				query.preload('company');

			if (preloadResponsible)
				query.preload('responsible');

			if (preloadSprints)
				query.preload('sprints');

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

	public async findOrFail(id: number, params?: FindOrFailQueryParams): Promise<Project> {
		let recordNotFoundMessage = 'Project not found';

		const query = Project.query()
			.select(params?.columns || this.columns)
			.where('id', id);

		if (params) {
			const {
				trashed = false,
				trashedOnly = false,
				withLogo = false,
				preloadCompany = false,
				preloadResponsible = false,
				preloadSprints = false,
			} = params;

			if (withLogo)
				query.select('logo');

			if (trashed && !trashedOnly)
				query.withTrashed();

			else if (!trashed && trashedOnly) {
				query.onlyTrashed();
				recordNotFoundMessage = 'No deleted project found';
			}

			if (preloadCompany)
				query.preload('company');

			if (preloadResponsible)
				query.preload('responsible');

			if (preloadSprints)
				query.preload('sprints');
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