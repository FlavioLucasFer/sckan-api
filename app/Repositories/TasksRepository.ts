import { ModelObject } from "@ioc:Adonis/Lucid/Orm";
import { DateTime } from "luxon";

import TaskLabel from "App/Models/TaskLabel";
import Priority from "App/Models/Priority";
import Label from "App/Models/Label";
import Task from "App/Models/Task";

export type PersistTaskFields = {
	name: string,
	description: string,
	plannedSize: number,
	size?: number,
	timeSpent?: DateTime,
	issueUrl?: string,
	user: number,
	sprint: number,
	status: number,
	priority: number,
};

export type UpdateTaskFields = {
	id: number,
	name?: string,
	description?: string,
	plannedSize?: number,
	size?: number,
	timeSpent?: DateTime,
	issueUrl?: string | null,
	archivedAt?: DateTime | null,
	user?: number,
	sprint?: number,
	status?: number,
	priority?: number,
};

export type AllQueryParams = {
	uuid?: string,
	name?: string,
	description?: string,
	plannedSize?: number,
	size?: number,
	timeSpent?: string,
	issueUrl?: string,
	user?: number,
	sprint?: number,
	status?: number,
	priority?: number,
	archived?: boolean,
	archivedOnly?: boolean,
	trashed?: boolean,
	trashedOnly?: boolean,
	preloadUser?: boolean,
	preloadPriority?: boolean,
	preloadSprint?: boolean,
	preloadStatus?: boolean,
	preloadLabels?: boolean,
	columns?: string[],
	limit?: number,
	page?: number,
	pageLimit?: number,
};

export type FindOrFailQueryParams = {
	archived?: boolean,
	archivedOnly?: boolean,
	trashed?: boolean,
	trashedOnly?: boolean,
	preloadUser?: boolean,
	preloadPriority?: boolean,
	preloadSprint?: boolean,
	preloadStatus?: boolean,
	preloadLabels?: boolean,
	columns?: string[],
};

interface TaskRepositoryInterface {
	persist(fields: PersistTaskFields): Promise<Task>;
	update(fields: UpdateTaskFields): Promise<Task>;
	delete(id: number): Promise<boolean>;
	restore(id: number): Promise<boolean>;
	archive(id: number): Promise<boolean>;
	unarchive(id: number): Promise<boolean>;
	attachLabel(taskId: number, labelId: number): Promise<Task>;
	unattachLabel(taskId: number, labelId: number): Promise<Task>;
	all(params?: AllQueryParams): Promise<Task[] | { meta: any; data: ModelObject[]; }>;
	findOrFail(id: number, params?: FindOrFailQueryParams): Promise<Task>;
	labels(taskId: number): Promise<Label[]>;
};

export default class TaskRepository implements TaskRepositoryInterface {
	private columns: string[];

	public constructor() {
		const columns = Array.from(Task.$columnsDefinitions, ([key]) => key);
		columns.splice(columns.indexOf('deletedAt'), 1);

		this.columns = columns;
	}

	public async persist(fields: PersistTaskFields): Promise<Task> {
		const {
			name,
			description,
			plannedSize,
			size,
			timeSpent,
			issueUrl,
			user,
			sprint,
			status,
			priority,
		} = fields;

		try {
			return await Task.create({
				name,
				description,
				plannedSize,
				size,
				timeSpent,
				issueUrl,
				userId: user,
				sprintId: sprint,
				statusId: status,
				priorityId: priority,
			});	
		} catch (err) {
			throw err;
		}
	}

	public async update(fields: UpdateTaskFields): Promise<Task> {
		const {
			id,
			name,
			description,
			plannedSize,
			size,
			timeSpent,
			issueUrl,
			user,
			sprint,
			status,
			priority,
		} = fields;
		let task: Task;

		try {
			task = await this.findOrFail(id);
		} catch (err) {
			throw err;
		}

		if (name)
			task.name = name;

		if (description)
			task.description = description;

		if (plannedSize)
			task.plannedSize = plannedSize;

		if (size)
			task.size = size;

		if (timeSpent)
			task.timeSpent = timeSpent;

		if (issueUrl)
			task.issueUrl = issueUrl;

		if (user)
			task.userId = user;

		if (sprint)
			task.sprintId = sprint;

		if (status)
			task.statusId = status;

		if (priority)
			task.priorityId = priority;

		try {
			await task.save();

			return await task.refresh();
		} catch (err) {
			throw err;
		}
	}

	public async delete(id: number): Promise<boolean> {
		let task: Task;

		try {
			task = await this.findOrFail(id);
		} catch (err) {
			throw err;
		}

		try {
			await task.softDelete();

			return true;
		} catch (err) {
			throw err;
		}
	}

	public async restore(id: number): Promise<boolean> {
		let task: Task;

		try {
			task = await this.findOrFail(id, { trashedOnly: true });
		} catch (err) {
			throw err;
		}

		try {
			await task.restore();

			return true;
		} catch (err) {
			throw err;
		}
	}

	public async archive(id: number): Promise<boolean> {
		let task: Task;

		try {
			task = await this.findOrFail(id);
		} catch (err) {
			throw err;
		}
		

		task.archivedAt = DateTime.now();

		try {
			await task.save();

			return true;
		} catch (err) {
			throw err;
		}
	}

	public async unarchive(id: number): Promise<boolean> {
		let task: Task;

		try {
			task = await this.findOrFail(id, { archivedOnly: true });
		} catch (err) {
			throw err;
		}

		task.archivedAt = null;

		try {
			await task.save();

			return true;
		} catch (err) {
			throw err;
		}
	}

	public async attachLabel(taskId: number, labelId: number): Promise<Task> {
		try {
			await TaskLabel.create({
				taskId,
				labelId,
			});
			
			return await this.findOrFail(taskId, { preloadLabels: true });
		} catch (err) {
			throw err;
		}
	}

	public async unattachLabel(taskId: number, labelId: number): Promise<Task> {
		let taskLabel: TaskLabel;

		try {
			taskLabel = await TaskLabel.query()
				.where('taskId', taskId)
				.where('labelId', labelId)
				.firstOrFail();
		} catch (err) {
			throw {
				code: err.code,
				message: `No label with id "${labelId}" is attached to task with id "${taskId}".`,
			};
		}

		try {
			await taskLabel.delete();

			return await this.findOrFail(taskId, { preloadLabels: true });
		} catch (err) {
			throw err;
		}
	}

	public async all(params?: AllQueryParams): Promise<Task[] | { meta: any; data: ModelObject[]; }> {
		const priorityLevelQuery = Priority.query()
			.select('level')
			.whereColumn('tasks.priority_id', '=', 'priorities.id');

		const query = Task.query()
			.select(params?.columns || this.columns)
			.orderBy(priorityLevelQuery, 'desc')
			.orderBy('id', 'desc');

		if (params) {
			const {
				uuid,
				name,
				description,
				plannedSize,
				size,
				timeSpent,
				issueUrl,
				user,
				sprint,
				status,
				priority,
				archived = false,
				archivedOnly = false,
				trashed = false,
				trashedOnly = false,
				preloadUser = false,
				preloadPriority = false,
				preloadSprint = false,
				preloadStatus = false,
				preloadLabels = false,
				limit,
			} = params;

			if (!archived && !archivedOnly)
				query.whereNull('archivedAt')
			
			else if (!archived && archivedOnly)
				query.whereNotNull('archivedAt');

			if (trashed && !trashedOnly)
				query.withTrashed();

			else if (!trashed && trashedOnly) 
				query.onlyTrashed();

			if (uuid)
				query.where('uuid', `%${uuid.includes('#') ? uuid.slice(1) : uuid}%`);
			
			if (name)
				query.where('name', 'LIKE', `%${name}%`);
	
			if (description)
				query.where('description', 'LIKE', `%${description}%`);
	
			if (plannedSize)
				query.where('plannedSize', plannedSize);
	
			if (size)
				query.where('size', size);
	
			if (timeSpent)
				query.where('timeSpent', timeSpent);
	
			if (issueUrl)
				query.where('issueUrl', 'LIKE', `%${issueUrl}%`);
	
			if (user)
				query.where('userId', user);
	
			if (sprint)
				query.where('sprintId', sprint);
	
			if (status)
				query.where('statusId', status);
	
			if (priority)
				query.where('priorityId', priority);
	
			if (limit)
				query.limit(limit);
			
			if (preloadPriority)
				query.preload('priority');

			if (preloadSprint)
				query.preload('sprint');

			if (preloadStatus)
				query.preload('status');

			if (preloadUser)
				query.preload('user');

			if (preloadLabels)
				query.preload('labels');
		} else {
			query.whereNull('archivedAt');
		}

		try {
			if (params?.page)
				return (await query.paginate(params.page, params.pageLimit || 50)).toJSON();

			return await query;
		} catch (err) {
			throw err;
		}
	}

	public async findOrFail(id: number, params?: FindOrFailQueryParams): Promise<Task> {
		let recordNotFoundMessage = 'Task not found';
		
		const query = Task.query()
			.select(params?.columns || this.columns)
			.where('id', id);

		if (params) {
			const {
				archived = false,
				archivedOnly = false,
				trashed = false,
				trashedOnly = false,
				preloadUser = false,
				preloadPriority = false,
				preloadSprint = false,
				preloadStatus = false,
				preloadLabels = false,
			} = params;

			if (trashed && !trashedOnly) 
				query.withTrashed();
			
			else if (!trashed && trashedOnly) {
				query.onlyTrashed();
				recordNotFoundMessage = 'No deleted task found';
			}

			if (!archived && !archivedOnly)
				query.whereNull('archivedAt');

			else if (!archived && archivedOnly) {
				query.whereNotNull('archivedAt');
				recordNotFoundMessage = 'No archived task found';
			}
	
			if (preloadPriority)
				query.preload('priority');
	
			if (preloadSprint)
				query.preload('sprint');
	
			if (preloadStatus)
				query.preload('status');
	
			if (preloadUser)
				query.preload('user');
	
			if (preloadLabels)
				query.preload('labels');
		} else {
			query.whereNull('archivedAt');
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

	public async labels(taskId: number): Promise<Label[]> {
		let task: Task;

		try {
			task = await this.findOrFail(taskId);
		} catch (err) {
			throw err;
		}

		try {
			return await task.related('labels').query();
		} catch (err) {
			throw err;
		}
	}
};
