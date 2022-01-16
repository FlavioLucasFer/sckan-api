import { ModelObject } from "@ioc:Adonis/Lucid/Orm";

import Role from "App/Models/Role";

export type PersistRoleFields = {
	name: string,
};

export type UpdateRoleFields = {
	id: number,
	name: string,
};

export type AllQueryParams = {
	columns?: string[],
	trashed?: boolean,
	trashedOnly?: boolean,
	preloadUsers?: boolean,
	limit?: number,
	page?: number,
	pageLimit?: number,
};

export type FindOrFailQueryParams = {
	columns?: string[],
	trashed?: boolean,
	trashedOnly?: boolean,
	preloadUsers?: boolean,
};

interface RolesRepositoryInterface {
	persist(fields: PersistRoleFields): Promise<Role>;
	update(fields: UpdateRoleFields): Promise<Role>;
	delete(id: number): Promise<boolean>;
	restore(id: number): Promise<boolean>;
	all(params?: AllQueryParams): Promise<Role[] | { meta: any; data: ModelObject[]; }>;
	findOrFail(id: number, params?: FindOrFailQueryParams): Promise<Role>;
};

export default class RolesRepository implements RolesRepositoryInterface {
	private columns: string[];

	public constructor() {
		const columns = Array.from(Role.$columnsDefinitions, ([key]) => key);
		columns.splice(columns.indexOf('deletedAt'), 1);

		this.columns = columns;
	}
	
	public async persist(fields: PersistRoleFields): Promise<Role> {
		const {
			name,
		} = fields;
		
		try {
			return await Role.create({
				id: name,
				name,
			});
		} catch (err) {
			throw err;
		}
	}

	public async update(fields: UpdateRoleFields): Promise<Role> {
		const {
			id,
			name,
		} = fields;
		let role: Role;

		try {
			role = await this.findOrFail(id);
		} catch (err) {
			throw err;
		}

		role.id = name;
		role.name = name;

		try {
			await role.save();

			return await role.refresh();
		} catch (err) {
			throw err;
		}
	}

	public async delete(id: number): Promise<boolean> {
		let role: Role;

		try {
			role = await this.findOrFail(id);
		} catch (err) {
			throw err;
		}

		try {
			await role.softDelete();

			return true;
		} catch (err) {
			throw err;
		}
	}

	public async restore(id: number): Promise<boolean> {
		let role: Role;

		try {
			role = await this.findOrFail(id, { trashedOnly: true });
		} catch (err) {
			throw err;
		}

		try {
			await role.restore();

			return true;
		} catch (err) {
			throw err;
		}
	}

	public async all(params?: AllQueryParams): Promise<Role[] | { meta: any; data: ModelObject[]; }> {
		const query = Role.query()
			.select(params?.columns || this.columns)

		if (params) {
			const {
				trashed,
				trashedOnly,
				preloadUsers,
				limit,
			} = params;

			if (trashed && !trashedOnly)
				query.withTrashed();

			else if (!trashed && trashedOnly)
				query.onlyTrashed();

			if (preloadUsers)
				query.preload('users');

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

	public async findOrFail(id: number, params?: FindOrFailQueryParams): Promise<Role> {
		let recordNotFoundMessage = 'Role not found';

		const query = Role.query()
			.select(params?.columns || this.columns)
			.where('id', id);
		
		if (params) {
			const {
				trashed,
				trashedOnly,
				preloadUsers,
			} = params;

			if (trashed && !trashedOnly)
				query.withTrashed();

			else if (!trashed && trashedOnly) {
				query.onlyTrashed();
				recordNotFoundMessage = 'No deleted role found';
			}
			
			if (preloadUsers)
				query.preload('users');
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
