import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

import Status from 'App/Models/Status';

import StoreStatusValidator from 'App/Validators/StoreStatusValidator';
import UpdateStatusValidator from 'App/Validators/UpdateStatusValidator';

export default class StatusesController {
	private columns: Array<string>;

	private constructor() {
		const columns = Array.from(Status.$columnsDefinitions, ([key]) => key);
		columns.splice(columns.indexOf('deletedAt'), 1);

		this.columns = columns;
	}
	
	public async index({ request, response }: HttpContextContract) {
		const {
			company,
			name,
			previousStatus,
			nextStatus,
			columns = this.columns,
			limit,
			page,
			pageLimit = 10,
		} = request.only([
			'company',
			'name',
			'previousStatus',
			'nextStatus',
			'columns',
			'limit',
			'page',
			'pageLimit',
		]);

		const query = Status.query()
			.select(typeof columns === 'string' ? columns.split(',') : columns);

		if (company)
			query.where('companyId', company)

		if (name)
			query.where('name', 'LIKE', `%${name}%`)

		if (previousStatus)
			query.where('previousStatusId', previousStatus)

		if (nextStatus)
			query.where('nextStatusId', nextStatus)

		if (limit)
			query.limit(limit);

		try {
			if (page)
				return (await query.paginate(page, pageLimit)).toJSON();

			return await query;
		} catch (err) {
			if (err?.errno)
				return response.badRequest(err);

			return response.internalServerError(err);
		}
	};

  public async store({ request, response }: HttpContextContract) {
		try {
			await request.validate(StoreStatusValidator);
		} catch (err) {
			return response.badRequest(err);
		}

		const {
			name,
			previousStatus,
			nextStatus,
			company,
		} = request.only([
			'name',
			'previousStatus',
			'nextStatus',
			'company'
		]);

		try {
			const status = await Status.create({
				name,
				previousStatusId: previousStatus,
				nextStatusId: nextStatus,
				companyId: company,
			});

			return response.created(status);
		} catch (err) {
			return response.internalServerError(err);
		}
	};

  public async show({ params, request, response }: HttpContextContract) {
		const { id } = params;

		const { columns = this.columns } = request.only(['columns']);

		try {
			return await Status.query()
				.select(typeof columns === 'string' ? columns.split(',') : columns)
				.where('id', id)
				.firstOrFail()
		} catch (err) {
			if (err.code === 'E_ROW_NOT_FOUND')
				return response.notFound({
					code: err.code,
					message: 'Record not found.',
				});

			if (err?.errno)
				return response.badRequest(err);

			return response.internalServerError(err);
		}
	};

  public async update({ params, request, response }: HttpContextContract) {
		const { id } = params;
		let status: Status;

		try {
			status = await Status.findOrFail(id);
		} catch (err) {
			return response.notFound({
				code: err.code,
				message: 'Record not found.',
			});
		}

		try {
			await request.validate(UpdateStatusValidator);
		} catch (err) {
			return response.badRequest(err);
		}

		const {
			name,
			previousStatus,
			nextStatus,
			company,
		} = request.only([
			'name',
			'previousStatus',
			'nextStatus',
			'company'
		]);

		if (name)
			status.name = name;

		if (previousStatus)
			status.previousStatusId = previousStatus;

		if (nextStatus)
			status.nextStatusId = nextStatus;

		if (company)
			status.companyId = company;

		try {
			await status.save();

			return status;
		} catch (err) {
			return response.internalServerError(err);
		}
	};

  public async destroy({ params, response }: HttpContextContract) {
		const { id } = params;
		let status: Status;

		try {
			status = await Status.findOrFail(id);
		} catch (err) {
			return response.notFound({
				code: err.code,
				message: 'Record not found.',
			});
		}

		try {
			await status.softDelete();
		} catch (err) {
			return response.internalServerError(err);
		}

		return true;
	};

  public async restore({ params, response }: HttpContextContract) {
		const { id } = params;
		let status: any;

		try {
			status = await Status.findOnlyTrashedOrFail(id);
		} catch (err) {
			return response.notFound({
				code: err.code,
				message: 'No deleted record found.',
			});
		}

		try {
			await status.restore();
		} catch (err) {
			return response.internalServerError(err);
		}

		return true;
	};
}
