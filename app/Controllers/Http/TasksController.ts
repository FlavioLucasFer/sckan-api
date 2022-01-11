import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { DateTime } from 'luxon';

import TaskLabel from 'App/Models/TaskLabel';
import Priority from 'App/Models/Priority';
import Task from 'App/Models/Task';

import AttachTaskLabelValidator from 'App/Validators/AttachTaskLabelValidator';
import UpdateTaskValidator from 'App/Validators/UpdateTaskValidator';
import StoreTaskValidator from 'App/Validators/StoreTaskValidator';

export default class TasksController {
	private columns: Array<string>;

	private constructor() {
		const columns = Array.from(Task.$columnsDefinitions, ([key]) => key);
		columns.splice(columns.indexOf('deletedAt'), 1);

		this.columns = columns;
	}

  public async index({ request, response }: HttpContextContract) {
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
			preload,
			columns = this.columns,
			limit,
			page,
			pageLimit = 10,
		} = request.only([
			'uuid',
			'name',
			'description',
			'plannedSize',
			'size',
			'timeSpent',
			'issueUrl',
			'user',
			'sprint',
			'status',
			'priority',
			'preload',
			'columns',
			'limit',
			'page',
			'pageLimit',
		]);

		const priorityLevelQuery = Priority.query()
			.select('level')
			.whereColumn('tasks.priority_id', '=','priorities.id');

		const query = Task.query()
			.select(typeof columns === 'string' ? columns.split(',') : columns)
			.whereNull('archivedAt')
			.orderBy(priorityLevelQuery, 'desc')
			.orderBy('id', 'desc');
		
		if (uuid) 
			query.where('uuid', `%${uuid.includes('#') ? uuid.slice(1) : uuid}%`);

		if (name)
			query.where('name', `%${description}%`);
		
		if (description)
			query.where('description', `%${description}%`);
		
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

		if (preload) {
			const preloads = preload.split(',');

			if (preloads.includes('user'))
				query.preload('priority');
			
			if (preloads.includes('sprint'))
				query.preload('sprint');
			
			if (preloads.includes('status'))
				query.preload('status');

			if (preloads.includes('priority'))
				query.preload('priority');

			if (preloads.includes('labels'))
				query.preload('labels');
		}

		try {
			if (page)
				return (await query.paginate(page, pageLimit)).toJSON();

			return await query;
		} catch (err) {
			if (err?.errno)
				return response.badRequest(err);

			return response.internalServerError(err);
		}
	};

  public async store({ request, response }: HttpContextContract) {
		try {
			await request.validate(StoreTaskValidator);
		} catch (err) {
			return response.badRequest(err);
		}

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
		} = request.only([
			'name',
			'description',
			'plannedSize',
			'size',
			'timeSpent',
			'issueUrl',
			'user',
			'sprint',
			'status',
			'priority',
		]);

		try {
			const task = await Task.create({
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

			return response.created(task);
		} catch (err) {
			return response.internalServerError(err);
		}
	};

  public async show({ params, request, response }: HttpContextContract) {
		const { id } = params;

		const { 
			columns = this.columns,
			preload, 
		} = request.only([
			'columns',
			'preload',
		]);

		const query = Task.query()
			.select(typeof columns === 'string' ? columns.split(',') : columns)
			.whereNull('archivedAt')
			.where('id', id);

		if (preload) {
			const preloads = preload.split(',');

			if (preloads.includes('user'))
				query.preload('priority');

			if (preloads.includes('sprint'))
				query.preload('sprint');

			if (preloads.includes('status'))
				query.preload('status');

			if (preloads.includes('priority'))
				query.preload('priority');

			if (preloads.includes('labels'))
				query.preload('labels');
		}

		try {
			return await query.firstOrFail();
		} catch (err) {
			if (err.code === 'E_ROW_NOT_FOUND')
				return response.notFound({
					code: err.code,
					message: 'Record not found.',
				});

			if (err?.errno)
				return response.badRequest(err);

			return response.internalServerError(err);
		}
	};

  public async update({ params, request, response }: HttpContextContract) {
		const { id } = params;
		let task: Task;

		try {
			task = await Task.query()
				.whereNull('archivedAt')
				.where('id', id)
				.firstOrFail();
		} catch (err) {
			return response.notFound({
				code: err.code,
				message: 'Record not found.',
			});
		}

		try {
			await request.validate(UpdateTaskValidator);
		} catch (err) {
			return response.badRequest(err);
		}

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
		} = request.only([
			'name',
			'description',
			'plannedSize',
			'size',
			'timeSpent',
			'issueUrl',
			'user',
			'sprint',
			'status',
			'priority',
		]);

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

			return task;
		} catch (err) {
			return response.internalServerError(err);
		}
	};

  public async archive({ params, response }: HttpContextContract) {
		const { id } = params;
		let task: Task;

		try {
			task = await Task.query()
				.whereNull('archivedAt')
				.where('id', id)
				.firstOrFail();
		} catch (err) {
			return response.notFound({
				code: err.code,
				message: 'Record not found.',
			});
		}
		
		task.archivedAt = DateTime.now();

		try {
			await task.save();

			return true;
		} catch (err) {
			return response.internalServerError(err);
		}
	};

  public async unarchive({ params, response }: HttpContextContract) {
		const { id } = params;
		let task: Task;

		try {
			task = await Task.query()
				.whereNotNull('archivedAt')
				.where('id', id)
				.firstOrFail();
		} catch (err) {
			return response.notFound({
				code: err.code,
				message: 'No archived task found.',
			});
		}

		task.archivedAt = null;

		try {
			await task.save();

			return true;
		} catch (err) {
			return response.internalServerError(err);
		}
	};

  public async destroy({ params, response }: HttpContextContract) {
		const { id } = params;
		let task: Task;

		try {
			task = await Task.query()
				.where('id', id)
				.firstOrFail();
		} catch (err) {
			return response.notFound({
				code: err.code,
				message: 'Record not found.',
			});
		}

		try {
			await task.softDelete();

			return true;
		} catch (err) {
			return response.internalServerError(err);
		}
	};

  public async restore({ params, response }: HttpContextContract) {
		const { id } = params;
		let task: Task;

		try {
			task = await Task.query()
				.whereNotNull('deletedAt')
				.where('id', id)
				.firstOrFail();
		} catch (err) {
			return response.notFound({
				code: err.code,
				message: 'No deleted record found.',
			});
		}

		try {
			await task.restore();

			return true;
		} catch (err) {
			return response.internalServerError(err);
		}
	};

	public async labels({ params, response }: HttpContextContract) {
		const { id } = params;
		let task: Task;

		try {
			task = await Task.findOrFail(id);
		} catch (err) {
			return response.notFound({
				code: err.code,
				message: 'Task not found.',
			});
		}

		try {
			return await task.related('labels').query();
		} catch (err) {
			return response.internalServerError(err);
		}
	}
	
	public async attachLabel({ request, response }: HttpContextContract) {
		try {
			await request.validate(AttachTaskLabelValidator);
		} catch (err) {
			return response.badRequest(err);
		}

		const {
			task,
			label,
		} = request.only([
			'task',
			'label',
		]);

		try {
			await TaskLabel.create({
				taskId: task,
				labelId: label,
			});

			return response.created(
				await Task.query()
					.where('id', task)
					.preload('labels')
					.first()
			);
		} catch (err) {
			return response.internalServerError(err);
		}
	}

	public async unattachLabel({ params, response }: HttpContextContract) {
		const {
			id: task,
			label_id: label,
		} = params;
		let taskLabel: TaskLabel;

		try {
			taskLabel = await TaskLabel.query()
				.where('taskId', task)
				.where('labelId', label)
				.firstOrFail();
		} catch (err) {
			return response.notFound({
				code: err.code,
				message: `No label with id "${label}" is attached to task with id "${task}".`,
			});
		}

		try {
			await taskLabel.delete();
			
			return await Task.query()
				.where('id', task)
				.preload('labels')
				.first();
		} catch (err) {
			return response.internalServerError(err);
		}
	}
}
