import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { schema, rules } from '@ioc:Adonis/Core/Validator';

export default class UpdatePriorityValidator {
	constructor(protected ctx: HttpContextContract) {};

	public schema = schema.create({
		name: schema.string.optional({ trim: true }, [
			rules.maxLength(20),
			rules.uniqueCompound('priorities', 'name', ['company_id'], ['company']),
		]),

		color: schema.string.optional({ trim: true }, [
			rules.minLength(6),
			rules.maxLength(6),
			rules.regex(/[0-9A-Fa-f]{6}/g),
		]),

		level: schema.number.optional([
			rules.unsigned(),
		]),

		company: schema.number.optional([
			rules.unsigned(),
			rules.exists({ table: 'companies', column: 'id' }),
		]),
	});

	public messages = {
		required: 'The {{ field }} field is required to create new priority',
		'name.uniqueCompound': 'Already has an priority with this name on this company. Name field must be unique',
		minLength: 'Min length for {{ field }} field is {{ options.maxLength }} chars',
		maxLength: 'Max length for {{ field }} field is {{ options.maxLength }} chars',
		'color.regex': 'The color format must be hexadecimal',
		'company.exists': 'The company must be a valid registred company',
	};
}
