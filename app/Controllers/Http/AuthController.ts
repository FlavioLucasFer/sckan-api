import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

import UsersRepository from 'App/Repositories/UsersRepository';

import LoginValidator from 'App/Validators/LoginValidator';

export default class AuthController {
	private usersRepository = new UsersRepository();
	
	public async login({ request, response } : HttpContextContract) {
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
			
		try {
			return await this.usersRepository.login(username, password);
		} catch (err) {
			if (err?.code === 'INVALID_CREDENTIALS_ERR')
				return response.badRequest(err);
			
			return response.internalServerError(err);
		}
	};

	public async logout({ response } : HttpContextContract) {
		try {
			return await this.usersRepository.logout();
		} catch (err) {
			return response.internalServerError(err);
		}
	}

	public async loggedUser({ response }: HttpContextContract) {
		try {
			return this.usersRepository.loggedUser();
		} catch (err) {
			return response.internalServerError(err);
		}
	}
}
