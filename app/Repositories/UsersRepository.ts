import { ModelObject } from "@ioc:Adonis/Lucid/Orm";

import User from "App/Models/User";

export type PersistUserFields = {
	name: string,
	username: string,
	password: string,
	email: string,
	company: number,
	role: string,
};

export type UpdateUserFields = {
	id: number,
	name?: string,
	username?: string,
	password?: string,
	email?: string,
	company?: number,
	role?: string,
};

export type FindOrFailQueryParams = {
	columns?: string[],
	trashed?: boolean,
	trashedOnly?: boolean,
	withPicture?: boolean,
	preloadCompany?: boolean,
	preloadRole?: boolean,
	preloadProjects?: boolean,
	preloadTasks?: boolean,
};

export type AllQueryParams = FindOrFailQueryParams & {
	name?: string,
	username?: string,
	email?: string,
	company?: number,
	role?: string, 
	limit?: number,
	page?: number,
	pageLimit?: number,
};

interface UsersRepositoryInterface {
	persist(fields: PersistUserFields): Promise<User>;
	update(fields: UpdateUserFields): Promise<User>;
	picture(id: number, picture: Buffer | null): Promise<User>;
	delete(id: number): Promise<boolean>;
	restore(id: number): Promise<boolean>;
	all(params?: AllQueryParams): Promise<User[] | { meta: any; data: ModelObject[]; }>;
	findOrFail(id: number, params?: FindOrFailQueryParams): Promise<User>;
};

export default class UsersRepository implements UsersRepositoryInterface {
	private columns: string[];

	public constructor() {
		const columns = Array.from(User.$columnsDefinitions, ([key]) => key);
		columns.splice(columns.indexOf('deletedAt'), 1);
		columns.splice(columns.indexOf('picture'), 1);

		this.columns = columns;
	}
	
	public async persist(fields: PersistUserFields): Promise<User> {
		const {
			name,
			username,
			password,
			email,
			company,
			role,
		} = fields;

		try {
			return await User.create({
				name,
				username,
				password,
				email,
				companyId: company,
				roleId: role,
			});
		} catch (err) {
			throw err;
		}
	}

	public async update(fields: UpdateUserFields): Promise<User> {
		const {
			id,
			name,
			username,
			password,
			email,
			company,
			role,
		} = fields;
		let user: User;

		try {
			user = await this.findOrFail(id);
		} catch (err) {
			throw err;
		}

		if (name)
			user.name = name;

		if (username)
			user.username = username;

		if (password)
			user.password = password;

		if (email)
			user.email = email;

		if (company)
			user.companyId = company;

		if (role)
			user.roleId = role;

		try {
			await user.save();

			return await user.refresh();
		} catch (err) {
			throw err;
		}
	}

	public async picture(id: number, picture: Buffer | null): Promise<User> {
		let user: User;

		try {
			user = await this.findOrFail(id);
		} catch (err) {
			throw err;
		}

		user.picture = picture;

		try {
			await user.save();
		} catch (err) {
			throw err;
		}

		return await user.refresh();
	}

	public async delete(id: number): Promise<boolean> {
		let user: User;

		try {
			user = await this.findOrFail(id);
		} catch (err) {
			throw err;
		}

		try {
			await user.softDelete();

			return true;
		} catch (err) {
			throw err;
		}
	}

	public async restore(id: number): Promise<boolean> {
		let user: User;

		try {
			user = await this.findOrFail(id, { trashedOnly: true });
		} catch (err) {
			throw err;
		}

		try {
			await user.restore();

			return true;
		} catch (err) {
			throw err;
		}
	}

	public async all(params?: AllQueryParams): Promise<User[] | { meta: any; data: ModelObject[]; }> {
		const query = User.query()
			.select(params?.columns || this.columns)

		if (params) {
			const {
				name,
				username,
				email,
				company,
				role,
				trashed = false,
				trashedOnly = false,
				withPicture = false,
				preloadCompany = false,
				preloadRole = false,
				preloadProjects = false,
				preloadTasks = false,
				limit,
			} = params;

			if (withPicture)
				query.select('picture');

			if (trashed && !trashedOnly)
				query.withTrashed();

			else if (!trashed && trashedOnly)
				query.onlyTrashed();

			if (name)
				query.where('name', 'LIKE', `%${name}%`);

			if (username)
				query.where('username', 'LIKE', `%${username}%`);

			if (email)
				query.where('email', 'LIKE', `%${email}%`);

			if (company)
				query.where('companyId', company);

			if (role)
				query.where('roleId', role);

			if (preloadCompany)
				query.preload('company');

			if (preloadRole)
				query.preload('role');

			if (preloadProjects)
				query.preload('projects');

			if (preloadTasks)
				query.preload('tasks');

			if (limit)
				query.limit(limit);
		}

		try {
			if (params?.page)
				return (await query.paginate(params.page, params.pageLimit || 10)).toJSON();

			return await query;
		} catch (err) {
			throw err;
		}
	}

	public async findOrFail(id: number, params?: FindOrFailQueryParams): Promise<User> {
		let recordNotFoundMessage = 'User not found';

		const query = User.query()
			.select(params?.columns || this.columns)
			.where('id', id);

		if (params) {
			const {
				trashed = false,
				trashedOnly = false,
				withPicture = false,
				preloadCompany = false,
				preloadRole = false,
				preloadProjects = false,
				preloadTasks = false,
			} = params;

			if (withPicture)
				query.select('picture');

			if (trashed && !trashedOnly)
				query.withTrashed();

			else if (!trashed && trashedOnly) {
				query.onlyTrashed();
				recordNotFoundMessage = 'No deleted user found';
			}

			if (preloadCompany)
				query.preload('company');

			if (preloadRole)
				query.preload('role');

			if (preloadProjects)
				query.preload('projects');

			if (preloadTasks)
				query.preload('tasks');
		}

		try {
			return await query.firstOrFail();	
		} catch (err) {
			if (err.code === 'E_ROW_NOT_FOUND')
				throw {
					code: err.code,
					message: recordNotFoundMessage,
				};

			throw err;
		}
	}
};
