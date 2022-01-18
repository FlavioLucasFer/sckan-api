import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import getStream from 'get-stream';

import StoreUserValidator from 'App/Validators/StoreUserValidator';
import UpdateUserValidator from 'App/Validators/UpdateUserValidator';

import UsersRepository from 'App/Repositories/UsersRepository';

export default class UsersController {
  private repository = new UsersRepository();
	
	public async index({ request, response }: HttpContextContract) {
		const {
			columns,
			preload,
			trashed,
			trashedOnly,
			withPicture,
			...reqQueryParams
		} = request.only([
			'name',
			'username',
			'email',
			'company',
			'role',
			'trashed',
			'trashedOnly',
			'limit',
			'page',
			'pageLimit',
			'columns',
			'preload',
			'withPicture',
		]);
		
		const preloads = preload ? preload.split(',') : [];

		try {
			return await this.repository.all({
				...reqQueryParams,
				columns: columns ? columns.split(',') : null,
				preloadCompany: preloads.includes('company'),
				preloadRole: preloads.includes('role'),
				preloadProjects: preloads.includes('projects'),
				preloadTasks: preloads.includes('tasks'),
				trashed: trashed === 'true',
				trashedOnly: trashedOnly === 'true',
				withPicture: withPicture === 'true',
			});
		} catch (err) {
			if (err?.errno)
				return response.badRequest(err);

			return response.internalServerError(err);
		}
	}

  public async store({ request, response }: HttpContextContract) {
		const reqBody = request.only([
			'name',
			'username',
			'password',
			'email',
			'company',
			'role',
		]); 
		
		try {
			await request.validate(StoreUserValidator);
		} catch (err) {
			return response.badRequest(err);
		}

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
			withPicture, 
		} = request.only([
			'columns',
			'preload',
			'withPicture',
		]);

		const preloads = preload ? preload.split(',') : [];
		
		try {
			return await this.repository.findOrFail(id, {
				columns: columns ? columns.split(',') : null,
				withPicture: withPicture === 'true',
				preloadCompany: preloads.includes('company'),
				preloadRole: preloads.includes('role'),
				preloadProjects: preloads.includes('projects'),
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

	public async picture({ params, request, response }: HttpContextContract) {
		const { id } = params;
		let picture: Buffer | null = null;

		try {
			request.multipart.onFile('picture', {
				size: '10mb',
				extnames: ['jpg', 'png', 'jpeg'],
			}, async file => {
				picture = await getStream.buffer(file);
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
			return await this.repository.picture(id, picture);
		} catch (err) {
			if (err.code === 'E_ROW_NOT_FOUND')
				return response.notFound(err);

			return response.internalServerError(err);
		}
	}

  public async update({ params, request, response }: HttpContextContract) {
		const { id } = params;

		try {
			await request.validate(UpdateUserValidator);
		} catch (err) {
			return response.badRequest(err);
		}

		const reqBody = request.only([
			'name',
			'username',
			'password',
			'email',
			'company',
			'role',
		]);
		
		try {
			return await this.repository.update({ id, ...reqBody });
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
