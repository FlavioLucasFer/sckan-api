import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

import RoleValidator from 'App/Validators/RoleValidator';

import RolesRepository from 'App/Repositories/RolesRepository';

export default class RolesController {
  private repository = new RolesRepository();
	
	public async index({ request, response }: HttpContextContract) {
		const {
			columns,
			preloadUsers,
			...reqQueryParams
		} = request.only([
			'columns',
			'preloadUsers',
			'limit',
			'page',
			'pageLimit',
		]);
		
		try {
			return await this.repository.all({
				...reqQueryParams,
				columns: columns ? columns.split(',') : [],
				preloadUsers: preloadUsers === 'true',
			});
		} catch (err) {
			if (err?.errno)
				return response.badRequest(err);

			return response.internalServerError(err);
		}
	}

  public async store({ request, response }: HttpContextContract) {
		try {
			await request.validate(RoleValidator);
		} catch (err) {
			return response.badRequest(err);
		}
		
		const { 
			name, 
		} = request.only([
			'name',
		]);

		try {
			return response.created(
				await this.repository.persist({ name }), 
			);
		} catch (err) {			
			return response.internalServerError(err);
		}
	}

  public async show({ params, request, response }: HttpContextContract) {
		const { id } = params;

		const {
			columns,
			preloadUsers,
		} = request.only([
			'columns',
			'preloadUsers',
		]);

		try {
			return await this.repository.findOrFail(id, {
				columns: columns ? columns.split(',') : [],
				preloadUsers: preloadUsers === 'true',
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
			await request.validate(RoleValidator);
		} catch (err) {
			return response.badRequest(err);
		}
		
		const { name } = request.only(['name']);

		try {
			return await this.repository.update({ 
				id, 
				name, 
			});
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
