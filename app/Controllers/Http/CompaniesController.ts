import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import getStream from 'get-stream';

import Company from 'App/Models/Company';
import StoreCompanyValidator from 'App/Validators/StoreCompanyValidator';
import UpdateCompanyValidator from 'App/Validators/UpdateCompanyValidator';

export default class CompaniesController {
  public async index({ request, response }: HttpContextContract) {
		try {
			const { withLogo } = request.only(['withLogo']);

			return response.ok(await Company.customAll(withLogo));
		} catch (err) {
			return response.badRequest(err);
		}
	}

  public async store({ request, response }: HttpContextContract) {
		try {
			await request.validate(StoreCompanyValidator);

			const {
				name,
				tradeName = null,
				email,
			} = request.only([
				'name',
				'tradeName',
				'email',
			]);
			
			const company = await Company.create({
				name,
				tradeName,
				email,
			});

			return response.created(company);
		} catch (err) {
			return response.badRequest(err);
		}
	}

  public async show({ params, request, response }: HttpContextContract) {
		try {
			const { id } = params;
			const { withLogo } = request.only(['withLogo']);

			return response.ok(await Company.customFindOrFail(id, withLogo));
		} catch (err) {
			if (err.code === 'E_ROW_NOT_FOUND')
				return response.notFound({
					code: err.code,
					message: 'Record not found.',
				});

			return response.badRequest(err);
		}

	}

	public async logo({ params, request, response }: HttpContextContract) {
		try {
			const { id } = params;
			let logo: Buffer | null = null;

			request.multipart.onFile('logo', {
				size: '2mb',
				extnames: ['jpg', 'png', 'jpeg'],
			}, async file => {
				logo = await getStream.buffer(file);
			});

			await request.multipart.process();

			const company = await Company.findOrFail(id);

			company.logo = logo;

			await company.save();

			return response.ok(company);
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
			
			const company = await Company.customFindOrFail(id, false);
			
			await request.validate(UpdateCompanyValidator);
			
			const {
				name,
				tradeName,
				email,
			} = request.only([
				'name',
				'tradeName',
				'email',
			]);

			if (name)
				company.name = name;
			if (tradeName)
				company.tradeName = tradeName;
			if (email)
				company.email = email;

			await company.save();

			return response.ok(company);
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

			const company = await Company.findOrFail(id);

			await company.softDelete();

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

			const company = await Company.findOnlyTrashedOrFail(id);

			await company.restore();

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
