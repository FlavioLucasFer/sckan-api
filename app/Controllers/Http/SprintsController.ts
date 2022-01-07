import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Database from '@ioc:Adonis/Lucid/Database';

import UpdateSprintValidator from 'App/Validators/UpdateSprintValidator';
import StoreSprintValidator from 'App/Validators/StoreSprintValidator';
import Sprint from 'App/Models/Sprint';

export default class SprintsController {
	private columns: Array<string>;

	private constructor() {
		const columns = Array.from(Sprint.$columnsDefinitions, ([key]) => key);
		columns.splice(columns.indexOf('deletedAt'), 1);

		this.columns = columns;
	}
	
	public async index({ request, response }: HttpContextContract) {
		const {
			project,
			name,
			description,
			startsAt,
			startsFrom,
			endsAt,
			endsFrom,
			startedAt,
			startedFrom,
			endedAt,
			endedFrom,
			columns = this.columns,
			limit,
			page,
			pageLimit = 10,
		} = request.only([
			'project',
			'name',
			'description',
			'startsAt',
			'startsFrom',
			'endsAt',
			'endsFrom',
			'startedAt',
			'startedFrom',
			'endedAt',
			'endedFrom',
			'columns',
			'limit',
			'page',
			'pageLimit',
		]);

		const query = Sprint.query()
			.select(typeof columns === 'string' ? columns.split(',') : columns);

		if (project)
			query.where('projectId', project);

		if (name)
			query.where('name', 'LIKE', `%${name}%`);

		if (description)
			query.where('description', 'LIKE', `%${description}%`);

		if (startsAt)
			query.where(Database.raw(`DATE_FORMAT(starts_at, '%Y-%m-%d') = '${startsAt}'`));

		if (startsFrom)
			query.where(Database.raw(`DATE_FORMAT(starts_at, '%Y-%m-%d') >= '${startsFrom}'`));

		if (endsAt)
			query.where(Database.raw(`DATE_FORMAT(ends_at, '%Y-%m-%d') = '${endsAt}'`));

		if (endsFrom)
			query.where(Database.raw(`DATE_FORMAT(ends_at, '%Y-%m-%d') >= '${endsFrom}'`));

		if (startedAt)
			query.where(Database.raw(`DATE_FORMAT(started_at, '%Y-%m-%d') = '${startedAt}'`));

		if (startedFrom)
			query.where(Database.raw(`DATE_FORMAT(started_at, '%Y-%m-%d') >= '${startedFrom}'`));		

		if (endedAt)
			query.where(Database.raw(`DATE_FORMAT(ended_at, '%Y-%m-%d') = '${endedAt}'`));

		if (endedFrom)
			query.where(Database.raw(`DATE_FORMAT(ended_at, '%Y-%m-%d') >= '${endedFrom}'`));

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
			await request.validate(StoreSprintValidator);
		} catch (err) {
			return response.badRequest(err);
		}	

		const {
			name,
			description,
			startsAt,
			endsAt,
			startedAt,
			endedAt,
			project,
		} = request.only([
			'name',
			'description',
			'startsAt',
			'endsAt',
			'startedAt',
			'endedAt',
			'project',
		]);

		try {
			const sprint = await Sprint.create({
				name,
				description,
				startsAt,
				endsAt,
				startedAt,
				endedAt,
				projectId: project,
			});

			return response.created(sprint);
		} catch (err) {
			return response.internalServerError(err);
		}
	};

  public async show({ params, request, response }: HttpContextContract) {
		const { id } = params;

		const { columns = this.columns } = request.only(['columns']); 

		try {
			return await Sprint.query()
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
		let sprint: Sprint;

		try {
			sprint = await Sprint.findOrFail(id);
		} catch (err) {
			return response.notFound({
				code: err.code,
				message: 'Record not found.',
			});
		}

		try {
			await request.validate(UpdateSprintValidator);
		} catch (err) {
			return response.badRequest(err);
		}

		const {
			name,
			description,
			startsAt,
			endsAt,
			startedAt,
			endedAt,
			project,
		} = request.only([
			'name',
			'description',
			'startsAt',
			'endsAt',
			'startedAt',
			'endedAt',
			'project',
		]);

		if (name)
			sprint.name = name;

		if (description)
			sprint.description = description;

		if (startsAt)
			sprint.startsAt = startsAt;

		if (endsAt)
			sprint.endsAt = endsAt;

		if (startedAt)
			sprint.startedAt = startedAt;

		if (endedAt)
			sprint.endedAt = endedAt;

		if (project)
			sprint.project = project;

		try {
			await sprint.save();

			return sprint;
		} catch (err) {
			return response.internalServerError(err);
		}
	};

  public async destroy({ params, response }: HttpContextContract) {
		const { id } = params;
		let sprint: Sprint;

		try {
			sprint = await Sprint.findOrFail(id);
		} catch (err) {
			return response.notFound({
				code: err.code,
				message: 'Record not found.',
			});
		}

		try {
			await sprint.softDelete();
		} catch (err) {
			return response.internalServerError(err);
		}

		return true;
	}

	public async restore({ params, response }: HttpContextContract) {
		const { id } = params;
		let sprint: any;

		try {
			sprint = await Sprint.findOnlyTrashedOrFail(id);
		} catch (err) {
			return response.notFound({
				code: err.code,
				message: 'No deleted record found.',
			});
		}

		try {
			await sprint.restore();
		} catch (err) {
			return response.internalServerError(err);
		}

		return true;
	}
}
