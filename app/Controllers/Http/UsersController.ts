import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import getStream from 'get-stream';

import User from 'App/Models/User';
import StoreUserValidator from 'App/Validators/StoreUserValidator';
import UpdateUserValidator from 'App/Validators/UpdateUserValidator';

export default class UsersController {
  public async index({ request, response }: HttpContextContract) {
		try {
			const { withPicture } = request.only(['withPicture']);

			return response.ok(await User.customAll(withPicture));
		} catch (err) {
			return response.badRequest(err);
		}
	}

  public async store({ request, response }: HttpContextContract) {
		try {
			await request.validate(StoreUserValidator);

			const {
				company,
				role,
				name,
				username,
				password,
				email,
			} = request.only([
				'company',
				'role',
				'name',
				'username',
				'password',
				'email',
			]); 

			const user = await User.create({
				companyId: company,
				roleId: role,
				name,
				username,
				password,
				email,
			});

			return response.created(user);
		} catch (err) {
			return response.badRequest(err);
		}
	}

  public async show({ params, request, response }: HttpContextContract) {
		try {
			const { id } = params;
			const { withPicture } = request.only(['withPicture']);

			return response.ok(await User.customFindOrFail(id, withPicture));
		} catch (err) {
			if (err.code === 'E_ROW_NOT_FOUND')
				return response.notFound({
					code: err.code,
					message: 'Record not found.',
				});

			return response.badRequest(err);
		}
	}

	public async picture({ params, request, response }: HttpContextContract) {
		try {
			const { id } = params;
			let picture: Buffer | null = null;

			request.multipart.onFile('picture', {
				size: '10mb',
				extnames: ['jpg', 'png', 'jpeg'],
			}, async file => {
				picture = await getStream.buffer(file);
			});

			await request.multipart.process();

			const user = await User.findOrFail(id);

			user.picture = picture;

			await user.save();

			return response.ok(user);
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

			const user = await User.customFindOrFail(id, false);

			await request.validate(UpdateUserValidator);

			const {
				company,
				role,
				name,
				username,
				password,
				email,
			} = request.only([
				'company',
				'role',
				'name',
				'username',
				'password',
				'email',
			]); 

			if (company)
				user.companyId = company;
			if (role)
				user.roleId = role;
			if (name)
				user.name = name;
			if (username)
				user.username = username;
			if (password)
				user.password = password;
			if (email)
				user.email = email;

			await user.save();

			return response.ok(user);
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

			const user = await User.findOrFail(id);

			await user.softDelete();

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

			const user = await User.findOnlyTrashedOrFail(id);

			await user.restore();

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
