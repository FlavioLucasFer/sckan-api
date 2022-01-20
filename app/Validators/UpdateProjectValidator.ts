import { schema, rules } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class UpdateProjectValidator {
  constructor(protected ctx: HttpContextContract) {};

  public schema = schema.create({
		company: schema.number.optional([
			rules.unsigned(),
			rules.exists({ table: 'companies', column: 'id' }),
		]),

		responsible: schema.number.optional([
			rules.unsigned(),
			rules.exists({ table: 'users', column: 'id' }),
			rules.existsInCompany('users', 'id'),
		]),

		name: schema.string.optional({ trim: true }, [
			rules.maxLength(255),
			rules.uniqueCompound('projects', 'name', ['company_id'], ['company']),
		]),

		description: schema.string.nullableAndOptional({ trim: true }),

		contractorName: schema.string.nullableAndOptional({ trim: true }, [
			rules.maxLength(255),
		]),

		cloneUrl: schema.string.nullableAndOptional({ trim: true }),
	});

  public messages = {
		required: 'The {{ field }} field is required to create new project',
		'name.uniqueCompound': 'Already has an project with this name on this company. Name field must be unique',
		maxLength: 'Max length for {{ field }} field is {{ options.maxLength }} chars',
		'company.exists': 'The company must be a valid registred company',
		'responsible.exists': 'The responsible must be a valid registred user',
		'responsible.existsInCompany': 'The responsible must be a valid registred user in this company',
	};
}
