import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

import PrioritiesRepository from 'App/Repositories/PrioritiesRepository';

import StorePriorityValidator from 'App/Validators/StorePriorityValidator';
import UpdatePriorityValidator from 'App/Validators/UpdatePriorityValidator';

export default class PrioritiesController {
	private repository = new PrioritiesRepository();

  public async index({ request, response }: HttpContextContract) {
		const {
			columns,
			preload,
			trashed,
			trashedOnly,
			...reqQueryParams
		} = request.only([
			'name',
			'color',
			'level',
			'company',
			'trashed',
			'trashedOnly',
			'limit',
			'page',
			'pageLimit',
			'columns',
			'preload',
		]);

		const preloads = preload ? preload.split(',') : [];

		try {
			return await this.repository.all({
				...reqQueryParams,
				columns: columns ? columns.split(',') : null,
				preloadCompany: preloads.includes('company'),
				preloadTasks: preloads.includes('tasks'),
			});
		} catch (err) {
			if (err?.errno)
				return response.badRequest(err);

			return response.internalServerError(err);
		}
	};

  public async store({ request, response }: HttpContextContract) {
		try {
			await request.validate(StorePriorityValidator);
		} catch (err) {
			return response.badRequest(err);			
		}

		const reqBody = request.only([
			'name',
			'color',
			'level',
			'company',
		]);

		try {
			return response.created(
				await this.repository.persist(reqBody),
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
				columns: columns ? columns.split(',') : null,
				preloadCompany: preloads.includes('company'),
				preloadTasks: preloads.includes('tasks'),
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
			await request.validate(UpdatePriorityValidator);
		} catch (err) {
			return response.badRequest(err);
		}

		const reqBody = request.only([
			'name',
			'color',
			'level',
			'company',
		]);

		try {
			return this.repository.update({ id, ...reqBody });
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
	}

	public async restore({ params, response }: HttpContextContract) {
		const { id } = params;

		try {
			return await this.repository.restore(id);
		} catch (err) {
			if (err.code === 'E_ROW_NOT_FOUND')
				return response.notFound(err);

			return response.internalServerError(err);
		}
	}
}
