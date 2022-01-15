import Hash from '@ioc:Adonis/Core/Hash';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

import LoginValidator from 'App/Validators/LoginValidator';
import User from 'App/Models/User';

export default class AuthController {
	public async login({ auth, request, response } : HttpContextContract) {
		try {
			await request.validate(LoginValidator);
		} catch (err) {
			return response.badRequest(err);
		}

		const { 
			username, 
			password, 
		} = request.only([
			'username', 
			'password',
		]);

		let user: User | null;
		const query = User.query()
			.select([
				'id',
				'password',
			])
			.where('username', username)
			.orWhere('email', username);
			
		try {
			user = await query.firstOrFail();
		} catch (err) {
			return response.badRequest('Invalid credentials');
		}

		if (!(await Hash.verify(user.password, password)))
			return response.badRequest('Invalid password');

		const token = await auth.use('api')
			.generate(user, {
				expiresIn: '7days',
			});

		return token.toJSON();
	};

	public async logout({ auth, response } : HttpContextContract) {
		try {
			await auth.use('api').revoke();

			return {
				revoked: true,
			};
		} catch (err) {
			return response.internalServerError(err);
		}
	}

	public async loggedUser({ auth }: HttpContextContract) {
		return auth.user;
	}
}
