import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Label from 'App/Models/Label';

import StoreLabelValidator from 'App/Validators/StoreLabelValidator';
import UpdateLabelValidator from 'App/Validators/UpdateLabelValidator';

export default class LabelsController {
	private columns: Array<string>;

	private constructor() {
		const columns = Array.from(Label.$columnsDefinitions, ([key]) => key);
		columns.splice(columns.indexOf('deletedAt'), 1);

		this.columns = columns;
	}
	
	public async index({ request, response }: HttpContextContract) {
		const {
			company,
			name,
			description,
			color,
			columns = this.columns,
			limit,
			page,
			pageLimit = 10,
		} = request.only([
			'company',
			'name',
			'description',
			'color',
			'columns',
			'limit',
			'page',
			'pageLimit',
		]);

		const query = Label.query()
			.select(typeof columns === 'string' ? columns.split(',') : columns);

		if (company)
			query.where('companyId', company);

		if (name)
			query.where('name', 'LIKE', `%${name}%`);

		if (description)
			query.where('description', 'LIKE', `%${description}%`);

		if (color)
			query.where('color', color);

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
	}

  public async store({ request, response }: HttpContextContract) {
		try {
			await request.validate(StoreLabelValidator);
		} catch (err) {
			return response.badRequest(err);
		}

		const {
			name,
			description,
			color,
			company,
		} = request.only([
			'name',
			'description',
			'color',
			'company',
		]);

		try {
			const label = await Label.create({
				name,
				description,
				color,
				companyId: company,
			});

			return response.created(label);
		} catch (err) {
			return response.internalServerError(err);
		}
	}

  public async show({ params, request, response }: HttpContextContract) {
		const { id } = params;

		const { columns = this.columns } = request.only(['columns']);

		try {
			return await Label.query()
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
	}

  public async update({ params, request, response }: HttpContextContract) {
		const { id } = params;
		let label: Label;

		try {
			label = await Label.findOrFail(id);
		} catch (err) {
			return response.notFound({
				code: err.code,
				message: 'Record not found.',
			});
		}

		try {
			await request.validate(UpdateLabelValidator);
		} catch (err) {
			return response.badRequest(err);
		}

		const {
			name,
			description,
			color,
			company,
		} = request.only([
			'name',
			'description',
			'color',
			'company',
		]);

		if (name)
			label.name = name;

		if (description)
			label.description = description;

		if (color)
			label.color = color;

		if (company)
			label.company = company;

		try {
			await label.save();

			return label;
		} catch (err) {
			return response.internalServerError(err);
		}
	}

  public async destroy({ params, response }: HttpContextContract) {
		const { id } = params;
		let label: Label;

		try {
			label = await Label.findOrFail(id);
		} catch (err) {
			return response.notFound({
				code: err.code,
				message: 'Record not found.',
			});
		}

		try {
			await label.softDelete();
		} catch (err) {
			return response.internalServerError(err);
		}

		return true;
	}

  public async restore({ params, response }: HttpContextContract) {
		const { id } = params;
		let label: any;

		try {
			label = await Label.findOnlyTrashedOrFail(id);
		} catch (err) {
			return response.notFound({
				code: err.code,
				message: 'No deleted record found.',
			});
		}

		try {
			await label.restore();
		} catch (err) {
			return response.internalServerError(err);
		}

		return true;
	}
}
