import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import getStream from 'get-stream';

import ProjectsRepository from 'App/Repositories/ProjectsRepository';

import UpdateProjectValidator from 'App/Validators/UpdateProjectValidator';
import StoreProjectValidator from 'App/Validators/StoreProjectValidator';

export default class ProjectsController {
	private repository = new ProjectsRepository();

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
			'description',
			'contractor',
			'cloneUrl',
			'company',
			'responsible',
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
				preloadCompany: preloads.includes('company'),
				preloadResponsible: preloads.includes('responsible'),
				preloadSprints: preloads.includes('sprints'),
				trashed: trashed === 'true',
				trashedOnly: trashedOnly === 'true',
				withLogo: withLogo === 'true',
			});
		} catch (err) {
			if (err?.errno)
				return response.badRequest(err);

			return response.internalServerError(err);
		}
	};

  public async store({ request, response }: HttpContextContract) {
		try {
			await request.validate(StoreProjectValidator);
		} catch (err) {
			return response.badRequest(err);
		}

		const reqBody = request.only([
			'name',
			'description',
			'contractorName',
			'cloneUrl',
			'company',
			'responsible',
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
				preloadCompany: preloads.includes('company'),
				preloadResponsible: preloads.includes('responsible'),
				preloadSprints: preloads.includes('sprints'),
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
			request.validate(UpdateProjectValidator);
		} catch (err) {
			return response.badRequest(err);
		}

		const reqBody = request.only([
			'name',
			'company',
			'responsible',
			'description',
			'contractorName',
			'cloneUrl',
		]);

		try {
			return this.repository.update({ id, ...reqBody });
		} catch (err) {
			if (err.code === 'E_ROW_NOT_FOUND')
				return response.notFound(err);

			return response.internalServerError(err);
		}
	};

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
