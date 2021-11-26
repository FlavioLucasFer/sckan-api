import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

import Role from 'App/Models/Role';
import RoleValidator from 'App/Validators/RoleValidator';

export default class RolesController {
  public async index({ response }: HttpContextContract) {
		try {
			const roles = await Role.all();

			return response.ok(roles);
		} catch (err) {
			return response.badRequest(err);
		}
	}

  public async store({ request, response }: HttpContextContract) {
		try {
			await request.validate(RoleValidator);

			const { name } = request.only(['name']);

			const role = await Role.create({
				id: name,
				name,
			});

			return response.created(role);
		} catch (err) {			
			return response.badRequest(err);
		}
	}

  public async show({ params, response }: HttpContextContract) {
		try {
			const { id } = params;

			const role = await Role.findOrFail(id);

			return response.ok(role);
		} catch (err) {
			if (err.code === 'E_ROW_NOT_FOUND')
				return response.notFound({
					code: err.code,
					message: 'Record not found.',
				});

			return response.badRequest(err);
		}
	}

  public async update({ params, request, response }: HttpContextContract) {
		try {
			const { id } = params;
			const role = await Role.findOrFail(id);

			await request.validate(RoleValidator);

			const { name } = request.only(['name']);

			role.id = name;
			role.name = name;

			await role.save();

			return response.ok(role);
		} catch (err) {
			if (err.code === 'E_ROW_NOT_FOUND')
				return response.notFound({
					code: err.code,
					message: 'Record not found.',
				});

			return response.badRequest(err);
		}
	}

  public async destroy({ params, response }: HttpContextContract) {
		try {
			const { id } = params;

			const role = await Role.findOrFail(id);

			await role.softDelete();

			return response.ok(true);
		} catch (err) {
			if (err.code === 'E_ROW_NOT_FOUND')
				return response.notFound({
					code: err.code,
					message: 'Record not found.',
				});

			return response.badRequest(err);
		}
	}

	public async restore({ params, response }: HttpContextContract) {
		try {
			const { id } = params;

			const role = await Role.findOnlyTrashedOrFail(id);

			await role.restore();

			return response.ok(true);
		} catch (err) {
			if (err.code === 'E_ROW_NOT_FOUND')
				return response.notFound({
					code: err.code,
					message: 'No deleted record found.',
				});

			return response.badRequest(err);
		}
	}
}
