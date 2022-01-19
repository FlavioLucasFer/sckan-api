import Database from "@ioc:Adonis/Lucid/Database";
import { ModelObject } from "@ioc:Adonis/Lucid/Orm";
import { DateTime } from "luxon";

import Sprint from "App/Models/Sprint";

export type PersistSprintsFields = {
	name?: string,
	description?: string,
	startsAt: DateTime,
	endsAt: DateTime,
	startedAt?: DateTime,
	endedAt?: DateTime,
	project: number,
};

export type UpdateSprintsFields = {
	id: number,
	name?: string,
	description?: string,
	startsAt?: DateTime,
	endsAt?: DateTime,
	startedAt?: DateTime,
	endedAt?: DateTime,
	project?: number,
};

export type FindOrFailQueryParams = {
	columns?: string[],
	trashed?: boolean,
	trashedOnly?: boolean,
	preloadProject?: boolean,
	preloadTasks?: boolean,
};

export type AllQueryParams = FindOrFailQueryParams & {
	name?: string,
	description?: string,
	startsAt?: string,
	endsAt?: string,
	startedAt?: string,
	endedAt?: string,
	project?: number,
	startsFrom?: string,
	endsFrom?: string,
	startedFrom?: string,
	endedFrom?: string,
	limit?: number,
	page?: number,
	pageLimit?: number,
};

interface SprintsRepositoryInterface {
	persist(fields: PersistSprintsFields): Promise<Sprint>;
	update(fields: UpdateSprintsFields): Promise<Sprint>;
	delete(id: number): Promise<boolean>;
	restore(id: number): Promise<boolean>;
	all(params?: AllQueryParams): Promise<Sprint[] | { meta: any; data: ModelObject[]; }>;
	findOrFail(id: number, params?: FindOrFailQueryParams): Promise<Sprint>;
};

export default class SprintsRepository implements SprintsRepositoryInterface {
	private columns: string[];

	public constructor() {
		const columns = Array.from(Sprint.$columnsDefinitions, ([key]) => key);
		columns.splice(columns.indexOf('deletedAt'), 1);

		this.columns = columns;
	}

	public async persist(fields: PersistSprintsFields): Promise<Sprint> {
		const {
			project,
		} = fields;

		try {
			return await Sprint.create({
				...fields,
				projectId: project,
			});
		} catch (err) {
			throw err;
		}
	}

	public async update(fields: UpdateSprintsFields): Promise<Sprint> {
		const {
			id,
			name,
			description,
			startsAt,
			endsAt,
			startedAt,
			endedAt,
			project,
		} = fields;
		let sprint: Sprint;

		try {
			sprint = await this.findOrFail(id);
		} catch (err) {
			throw err;
		}

		if (name)
			sprint.name = name;

		if (description)
			sprint.description = description;

		if (startsAt)
			sprint.startsAt = startsAt;

		if (endsAt)
			sprint.endsAt = endsAt;

		if (startedAt)
			sprint.startedAt = startedAt;

		if (endedAt)
			sprint.endedAt = endedAt;

		if (project)
			sprint.projectId = project;
		
		try {
			await sprint.save();

			return await sprint.refresh();
		} catch (err) {
			throw err;
		}
	}

	public async delete(id: number): Promise<boolean> {
		let sprint: Sprint;

		try {
			sprint = await this.findOrFail(id);
		} catch (err) {
			throw err;
		}

		try {
			await sprint.softDelete();

			return true;
		} catch (err) {
			throw err;
		}
	}

	public async restore(id: number): Promise<boolean> {
		let sprint: Sprint;

		try {
			sprint = await this.findOrFail(id, { trashedOnly: true });
		} catch (err) {
			throw err;
		}

		try {
			await sprint.restore();

			return true;
		} catch (err) {
			throw err;
		}
	}

	public async all(params?: AllQueryParams): Promise<Sprint[] | { meta: any; data: ModelObject[]; }> {
		const query = Sprint.query()
			.select(params?.columns || this.columns);

		if (params) {
			const {
				name,
				description,
				startsAt,
				endsAt,
				startedAt,
				endedAt,
				project,
				startsFrom,
				endsFrom,
				startedFrom,
				endedFrom,
				trashed = false,
				trashedOnly = false,
				preloadProject = false,
				preloadTasks = false,
				limit,
			} = params;

			if (trashed && !trashedOnly)
				query.withTrashed();

			else if (!trashed && trashedOnly)
				query.onlyTrashed();

			if (name)
				query.where('name', 'LIKE', `%${name}%`);

			if (description)
				query.where('description', 'LIKE', `%${description}%`);

			if (startsAt)
				query.where(Database.raw(`DATE_FORMAT(starts_at, '%Y-%m-%d') = '${startsAt}'`));

			if (startsFrom)
				query.where(Database.raw(`DATE_FORMAT(starts_at, '%Y-%m-%d') >= '${startsFrom}'`));

			if (endsAt)
				query.where(Database.raw(`DATE_FORMAT(ends_at, '%Y-%m-%d') = '${endsAt}'`));

			if (endsFrom)
				query.where(Database.raw(`DATE_FORMAT(ends_at, '%Y-%m-%d') >= '${endsFrom}'`));

			if (startedAt)
				query.where(Database.raw(`DATE_FORMAT(started_at, '%Y-%m-%d') = '${startedAt}'`));

			if (startedFrom)
				query.where(Database.raw(`DATE_FORMAT(started_at, '%Y-%m-%d') >= '${startedFrom}'`));

			if (endedAt)
				query.where(Database.raw(`DATE_FORMAT(ended_at, '%Y-%m-%d') = '${endedAt}'`));

			if (endedFrom)
				query.where(Database.raw(`DATE_FORMAT(ended_at, '%Y-%m-%d') >= '${endedFrom}'`));

			if (project)
				query.where('projectId', project);

			if (preloadProject)
				query.preload('project');

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

	public async findOrFail(id: number, params?: FindOrFailQueryParams): Promise<Sprint> {
		let recordNotFoundMessage = 'Sprint not found';

		const query = Sprint.query()
			.select(params?.columns || this.columns)
			.where('id', id);

		if (params) {
			const {
				trashed = false,
				trashedOnly = false,
				preloadProject = false,
				preloadTasks = false,
			} = params;

			if (trashed && !trashedOnly)
				query.withTrashed();

			else if (!trashed && trashedOnly) {
				query.onlyTrashed();
				recordNotFoundMessage = 'No deleted sprint found';
			}

			if (preloadProject)
				query.preload('project');

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