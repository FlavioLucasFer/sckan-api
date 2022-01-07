import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import getStream from 'get-stream';

import UpdateProjectValidator from 'App/Validators/UpdateProjectValidator';
import StoreProjectValidator from 'App/Validators/StoreProjectValidator';
import Project from 'App/Models/Project';

export default class ProjectsController {
	private columns: Array<string>;

	private constructor() {
		const columns = Array.from(Project.$columnsDefinitions, ([key]) => key);
		columns.splice(columns.indexOf('logo'), 1);
		columns.splice(columns.indexOf('deletedAt'), 1);

		this.columns = columns;
	}

  public async index({ request, response }: HttpContextContract) {
		const {
			company,
			responsible,
			name,
			description,
			withLogo,
			columns = this.columns,
			limit,
			page,
			pageLimit = 10,
		} = request.only([
			'company',
			'responsible',
			'name',
			'description',
			'withLogo',
			'columns',
			'limit',
			'page',
			'pageLimit',
		]);
		
		const query = Project.query()
			.select(typeof columns === 'string' ? columns.split(',') : columns);
		
		if (withLogo)
			query.select('logo');

		if (company)
			query.where('company_id', company);
		
		if (responsible)
			query.where('responsible_id', responsible);

		if (name)
			query.where('name', 'LIKE', `%${name}%`);
		
		if (description)
			query.where('description', 'LIKE', `%${description}%`);

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
			await request.validate(StoreProjectValidator);
		} catch (err) {
			return response.badRequest(err);
		}

		const {
			name,
			company,
			responsible,
			description,
			contractorName,
			cloneUrl,
		} = request.only([
			'name',
			'company',
			'responsible',
			'description',
			'contractorName',
			'cloneUrl',
		]);

		try {
			const project = await Project.create({
				name,
				companyId: company,
				responsibleId: responsible,
				description,
				contractorName,
				cloneUrl,
			});

			return response.created(project);
		} catch (err) {
			return response.internalServerError(err);
		}
	};

  public async show({ params, request, response }: HttpContextContract) {
		const { id } = params;
		
		const {
			columns = this.columns,
			withLogo,
		} = request.only([
			'columns',
			'withLogo',
		]);

		const query = Project.query()
			.select(typeof columns === 'string' ? columns.split(',') : columns)
			.where('id', id);
		
		if (withLogo)
			query.select('logo');
		
		try {
			return await query.firstOrFail();
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
		let project: Project;

		try {
			project = await Project.customFindOrFail(id);
		} catch (err) {
			return response.notFound({
				code: err.code,
				message: 'Record not found.',
			});
		}

		try {
			request.validate(UpdateProjectValidator);
		} catch (err) {
			return response.badRequest(err);
		}

		const {
			name,
			company,
			responsible,
			description,
			contractorName,
			cloneUrl,
		} = request.only([
			'name',
			'company',
			'responsible',
			'description',
			'contractorName',
			'cloneUrl',
		]);

		if (name)
			project.name = name;

		if (company)
			project.companyId = company;
		
		if (responsible)
			project.responsibleId = responsible;

		if (description)
			project.description = description;
		
		if (contractorName)
			project.contractorName = contractorName;

		if (cloneUrl)
			project.cloneUrl = cloneUrl;

		try {
			await project.save();

			return project;
		} catch (err) {
			return response.internalServerError(err);
		}
	};

	public async logo({ params, request, response }: HttpContextContract) {
		const { id } = params;
		
		let project: Project;
		let logo: Buffer | null = null;

		try {
			project = await Project.findOrFail(id);
		} catch (err) {
			return response.notFound({
				code: err.code,
				message: 'Record not found.',
			});
		}

		request.multipart.onFile('logo', {
			size: '5mb',
			extnames: ['jpg', 'png', 'jpeg'],
		}, async file => {
			try {
				logo = await getStream.buffer(file);
			} catch (err) {
				return response.badRequest(err);
			}
		});

		try {
			await request.multipart.process();
		} catch (err) {
			return response.internalServerError(err);
		}

		project.logo = logo;

		try {
			await project.save();
		} catch (err) {
			if (err?.errno)
				return response.badRequest(err);

			return response.internalServerError(err);
		}

		return true;
	}

  public async destroy({ params, response }: HttpContextContract) {
		const { id } = params;
		let project: Project;

		try {
			project = await Project.customFindOrFail(id);
		} catch (err) {
			return response.notFound({
				code: err.code,
				message: 'Record not found.',
			});
		}
		
		try {
			await project.softDelete();
		} catch (err) {
			return response.internalServerError(err);	
		}

		return true;
	};

	public async restore({ params, response }: HttpContextContract) {
		const { id } = params;
		let project: any;

		try {
			project = await Project.findOnlyTrashedOrFail(id);
		} catch (err) {
			return response.notFound({
				code: err.code,
				message: 'No deleted record found.',
			});
		}

		try {
			await project.restore();
		} catch (err) {
			return response.internalServerError(err);
		}

		return true;
	};
}
