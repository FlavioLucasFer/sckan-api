import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import LabelsRepository from 'App/Repositories/LabelsRepository';



import StoreLabelValidator from 'App/Validators/StoreLabelValidator';
import UpdateLabelValidator from 'App/Validators/UpdateLabelValidator';

export default class LabelsController {	
	private repository = new LabelsRepository();
	
	public async index({ request, response }: HttpContextContract) {
		const {
			columns,
			preload,
			trashed,
			trashedOnly,
			...reqQueryParams
		} = request.only([
			'name',
			'description',
			'color',
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
	}

  public async store({ request, response }: HttpContextContract) {
		try {
			await request.validate(StoreLabelValidator);
		} catch (err) {
			return response.badRequest(err);
		}

		const reqBody = request.only([
			'name',
			'description',
			'color',
			'company',
		]);

		try {
			return response.created(
				await this.repository.persist(reqBody),
			);
		} catch (err) {
			return response.internalServerError(err);
		}
	}

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
	}

  public async update({ params, request, response }: HttpContextContract) {
		const { id } = params;

		try {
			await request.validate(UpdateLabelValidator);
		} catch (err) {
			return response.badRequest(err);
		}

		const reqBody = request.only([
			'name',
			'description',
			'color',
			'company',
		]);

		try {
			return this.repository.update({ id, ...reqBody });
		} catch (err) {
			if (err.code === 'E_ROW_NOT_FOUND')
				return response.notFound(err);

			return response.internalServerError(err);
		}
	}

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
