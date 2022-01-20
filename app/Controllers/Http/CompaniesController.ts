import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import getStream from 'get-stream';

import CompaniesRepository from 'App/Repositories/CompaniesRepository';

import StoreCompanyValidator from 'App/Validators/StoreCompanyValidator';
import UpdateCompanyValidator from 'App/Validators/UpdateCompanyValidator';

export default class CompaniesController {
  private repository = new CompaniesRepository();
	
	public async index({ request, response }: HttpContextContract) {
		const {
			columns,
			preload,
			trashed,
			trashedOnly,
			withLogo,
			...reqQueryParams
		} = request.only([
			'name',
			'tradeName',
			'email',
			'trashed',
			'trashedOnly',
			'limit',
			'page',
			'pageLimit',
			'columns',
			'preload',
			'withLogo',
		]);

		const preloads = preload ? preload.split(',') : [];

		try {
			return await this.repository.all({
				...reqQueryParams,
				columns: columns ? columns.split(',') : null,
				preloadUsers: preloads.includes('users'),
				preloadProjects: preloads.includes('projects'),
				preloadLabels: preloads.includes('labels'),
				preloadStatuses: preloads.includes('statuses'),
				preloadPriorities: preloads.includes('priorities'),
				trashed: trashed === 'true',
				trashedOnly: trashedOnly === 'true',
				withLogo: withLogo === 'true',
			});
		} catch (err) {
			if (err?.errno)
				return response.badRequest(err);

			return response.internalServerError(err);
		}
	}

  public async store({ request, response }: HttpContextContract) {
		try {
			await request.validate(StoreCompanyValidator);
		} catch (err) {
			return response.badRequest(err);
		}

		const reqBody = request.only([
			'name',
			'tradeName',
			'email',
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
			withLogo,
		} = request.only([
			'columns',
			'preload',
			'withLogo',
		]);

		const preloads = preload ? preload.split(',') : [];
		
		try {
			return await this.repository.findOrFail(id, {
				columns: columns ? columns.split(',') : null,
				withLogo: withLogo === 'true',
				preloadUsers: preloads.includes('users'),
				preloadProjects: preloads.includes('projects'),
				preloadLabels: preloads.includes('labels'),
				preloadStatuses: preloads.includes('statuses'),
				preloadPriorities: preloads.includes('priorities'),
			});
		} catch (err) {
			if (err.code === 'E_ROW_NOT_FOUND')
				return response.notFound(err);

			if (err?.errno)
				return response.badRequest(err);

			return response.internalServerError(err);
		}

	}

	public async logo({ params, request, response }: HttpContextContract) {
		const { id } = params;
		let logo: Buffer | null = null;
		
		try {
			request.multipart.onFile('logo', {
				size: '2mb',
				extnames: ['jpg', 'png', 'jpeg'],
			}, async file => {
				logo = await getStream.buffer(file);
			});
		} catch (err) {
			return response.badRequest(err);
		}

		try {
			await request.multipart.process();
		} catch (err) {
			return response.internalServerError(err);
		}

		try {
			return await this.repository.logo(id, logo);
		} catch (err) {
			if (err.code === 'E_ROW_NOT_FOUND')
				return response.notFound(err);

			return response.internalServerError(err);
		}
	}

  public async update({ params, request, response }: HttpContextContract) {
		const { id } = params;

		try {				
			await request.validate(UpdateCompanyValidator);
		} catch (err) {
			return response.badRequest(err);
		}

		const reqBody = request.only([
			'name',
			'tradeName',
			'email',
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
