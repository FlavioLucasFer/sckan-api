import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

import Priority from 'App/Models/Priority';

import StorePriorityValidator from 'App/Validators/StorePriorityValidator';
import UpdatePriorityValidator from 'App/Validators/UpdatePriorityValidator';

export default class PrioritiesController {
	private columns: Array<string>;

	private constructor() {
		const columns = Array.from(Priority.$columnsDefinitions, ([key]) => key);
		columns.splice(columns.indexOf('deletedAt'), 1);

		this.columns = columns;
	}

  public async index({ request, response }: HttpContextContract) {
		const {
			company,
			name,
			color,
			level,
			columns = this.columns,
			limit,
			page,
			pageLimit = 10,
		} = request.only([
			'company',
			'name',
			'color',
			'level',
			'columns',
			'limit',
			'page',
			'pageLimit',
		]);

		const query = Priority.query()
			.select(typeof columns === 'string' ? columns.split(',') : columns)
			.orderBy('level', 'desc')
			.orderBy('name', 'asc');

		if (company)
			query.where('companyId', company);

		if (name)
			query.where('name', 'LIKE', `%${name}%`);
			
		if (color)
			query.where('color', color);

		if (level)
			query.where('level', level);

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
			await request.validate(StorePriorityValidator);
		} catch (err) {
			return response.badRequest(err);			
		}

		const {
			name,
			color,
			level,
			company,
		} = request.only([
			'name',
			'color',
			'level',
			'company',
		]);

		try {
			const priority = await Priority.create({
				name,
				color,
				level,
				companyId: company,
			});

			return response.created(priority);
		} catch (err) {
			return response.internalServerError(err);
		}
	};

  public async show({ params, request, response }: HttpContextContract) {
		const { id } = params;

		const { columns = this.columns } = request.only(['columns']);

		try {
			return await Priority.query()
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
		let priority: Priority;

		try {
			priority = await Priority.findOrFail(id);
		} catch (err) {
			return response.notFound({
				code: err.code,
				message: 'Record not found.',
			});
		}

		try {
			await request.validate(UpdatePriorityValidator);
		} catch (err) {
			return response.badRequest(err);
		}

		const {
			name,
			color,
			level,
			company,
		} = request.only([
			'name',
			'color',
			'level',
			'company',
		]);

		if (name)
			priority.name = name;

		if (color)
			priority.color = color;

		if (level)
			priority.level = level;

		if (company)
			priority.company = company;

		try {
			await priority.save();

			return priority;
		} catch (err) {
			return response.internalServerError(err);
		}
	};

  public async destroy({ params, response }: HttpContextContract) {
		const { id } = params;
		let priority: Priority;

		try {
			priority = await Priority.findOrFail(id);
		} catch (err) {
			return response.notFound({
				code: err.code,
				message: 'Record not found.',
			});
		}

		try {
			await priority.softDelete();
		} catch (err) {
			return response.internalServerError(err);
		}

		return true;
	};

  public async restore({ params, response }: HttpContextContract) {
		const { id } = params;
		let priority: any;

		try {
			priority = await Priority.findOnlyTrashedOrFail(id);
		} catch (err) {
			return response.notFound({
				code: err.code,
				message: 'No deleted record found.',
			});
		}

		try {
			await priority.restore();
		} catch (err) {
			return response.internalServerError(err);
		}

		return true;
	};
}
