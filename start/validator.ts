import Database from '@ioc:Adonis/Lucid/Database';
import { validator } from '@ioc:Adonis/Core/Validator';

validator.rule('uniqueCompound', async (
	value,
	[
		table,
		column,
		fields,
		fieldsAlias,
	],
	options,
) => {
	const query = Database
		.from(table)
		.select('id')
		.where(column, value);

	fields.forEach((field: string, index: number) => {
		try {
			const reqField = options.root[fieldsAlias[index] ? fieldsAlias[index] : field];

			if (!reqField)
				return;

			query.where(field, reqField);
		} catch (err) {
			throw new Error("Fields dont match");
		}
	});
	
	const exist = await query.first();

	if (exist) {
		options.errorReporter.report(
			options.pointer,
			'uniqueCompound',
			`${options.pointer} must be unique`,
			options.arrayExpressionPointer,
			{ exist },
		);
	}
}, () => {
	return {
		async: true,
	};
});

validator.rule('existsInCompany', async (
	value,
	[
		table,
		column,
		companyColumn = 'company',
	],
	options,
) => {
	const exist = await Database
		.from(table)
		.select('id')
		.where(column, value)
		.where('company_id', options.root[companyColumn])
		.first();

	if (!exist) {
		options.errorReporter.report(
			options.pointer,
			'existsInCompany',
			`${options.pointer} must exists in this company`,
			options.arrayExpressionPointer,
			{ exist },
		);
	}
}, () => {
	return {
		async: true,
	};
});
