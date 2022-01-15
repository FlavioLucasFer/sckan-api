import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

import AttachTaskLabelValidator from 'App/Validators/AttachTaskLabelValidator';
import UpdateTaskValidator from 'App/Validators/UpdateTaskValidator';
import StoreTaskValidator from 'App/Validators/StoreTaskValidator';

import TaskRepository from 'App/Repositories/TaskRepository';

export default class TasksController {
	private repository = new TaskRepository();

  public async index({ request, response }: HttpContextContract) {
		const {
			preload,
			columns,
			...reqQueryParams
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

		const preloads = preload ? preload.split(',') : [];

		try {
			return await this.repository.all({
				...reqQueryParams,
				columns: columns ? columns.split(',') : [],
				preloadUser: preloads.includes('user'),
				preloadPriority: preloads.includes('priority'),
				preloadSprint: preloads.includes('sprint'),
				preloadStatus: preloads.includes('status'),
				preloadLabels: preloads.includes('labels'),
			});
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

		const reqBody = request.only([
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
			return response.created(
				await this.repository.persist(reqBody)
			);
		} catch (err) {
			return response.internalServerError(err);
		}
	};

  public async show({ params, request, response }: HttpContextContract) {
		const { id } = params;

		const { 
			columns,
			preload, 
		} = request.only([
			'columns',
			'preload',
		]);

		const preloads = preload ? preload.split(',') : [];

		try {
			return await this.repository.findOrFail(id, {
				columns: columns ? columns.split(',') : [],
				preloadUser: preloads.includes('user'),
				preloadPriority: preloads.includes('priority'),
				preloadSprint: preloads.includes('sprint'),
				preloadStatus: preloads.includes('status'),
				preloadLabels: preloads.includes('labels'),
			});
		} catch (err) {
			if (err.code === 'E_ROW_NOT_FOUND')
				return response.notFound(err);

			if (err?.errno)
				return response.badRequest(err);

			return response.internalServerError(err);
		}
	};

  public async update({ params, request, response }: HttpContextContract) {
		const { id } = params;

		try {
			await request.validate(UpdateTaskValidator);
		} catch (err) {
			return response.badRequest(err);
		}

		const reqBody = request.only([
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
			return await this.repository.update({ id, ...reqBody});
		} catch (err) {
			if (err.code === 'E_ROW_NOT_FOUND')
				return response.notFound(err);

			return response.internalServerError(err);
		}
	};

  public async archive({ params, response }: HttpContextContract) {
		const { id } = params;

		try {
			return await this.repository.archive(id);
		} catch (err) {
			if (err.code === 'E_ROW_NOT_FOUND')
				return response.notFound(err);

			return response.internalServerError(err);
		}
	};

  public async unarchive({ params, response }: HttpContextContract) {
		const { id } = params;

		try {
			await this.repository.unarchive(id);

			return true;
		} catch (err) {
			if (err.code === 'E_ROW_NOT_FOUND')
				return response.notFound(err);

			return response.internalServerError(err);
		}
	};

  public async destroy({ params, response }: HttpContextContract) {
		const { id } = params;

		try {
			return await this.repository.delete(id);
		} catch (err) {
			if (err.code === 'E_ROW_NOT_FOUND')
				return response.notFound(err);

			return response.internalServerError(err);
		}
	};

  public async restore({ params, response }: HttpContextContract) {
		const { id } = params;

		try {
			return await this.repository.restore(id);
		} catch (err) {
			if (err.code === 'E_ROW_NOT_FOUND')
				return response.notFound(err);

			return response.internalServerError(err);
		}
	};

	public async labels({ params, response }: HttpContextContract) {
		const { id } = params;

		try {
			return await this.repository.labels(id);
		} catch (err) {
			if (err.code === 'E_ROW_NOT_FOUND')
				return response.notFound(err);

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
			return response.created(await this.repository.attachLabel(task, label));
		} catch (err) {
			return response.internalServerError(err);
		}
	}

	public async unattachLabel({ params, response }: HttpContextContract) {
		const {
			id: task,
			labelId: label,
		} = params;

		try {
			return await this.repository.unattachLabel(task, label);
		} catch (err) {
			return response.internalServerError(err);
		}
	}
}
