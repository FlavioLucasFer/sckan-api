declare module '@ioc:Adonis/Core/Validator' {
	interface Rules {
		uniqueCompound(
			table: string, 
			column: string, 
			fields: Array<string>, 
			fieldsAlias?: Array<string>,
			idColumn?: string,
		): Rule,
		existsInCompany(
			table: string, 
			column: string, 
			companyColumn?: string, 
		): Rule,
	}
};