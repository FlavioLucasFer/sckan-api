import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { schema, rules } from '@ioc:Adonis/Core/Validator';

export default class StoreStatusValidator {
  constructor(protected ctx: HttpContextContract) {};

  public schema = schema.create({
		name: schema.string({ trim: true }, [
			rules.maxLength(20),
			rules.uniqueCompound('statuses', 'name', ['company_id'], ['company']),
		]),

		previousStatus: schema.number.nullableAndOptional([
			rules.unsigned(),
			rules.exists({ table: 'statuses', column: 'id' }),
		]),
		
		nextStatus: schema.number.nullableAndOptional([
			rules.unsigned(),
			rules.exists({ table: 'statuses', column: 'id' }),
		]),
		
		company: schema.number([
			rules.unsigned(),
			rules.exists({ table: 'companies', column: 'id' }),
		]),
	});

  public messages = {
		required: 'The {{ field }} field is required to create new status',
		'name.uniqueCompound': 'Already has an status with this name on this company. Name field must be unique',
		maxLength: 'Max length for {{ field }} field is {{ options.maxLength }} chars',
		'company.exists': 'The company must be a valid registred company',
		'previousStatus.exists': 'The previous status must be a valid registred status',
		'nextStatus.exists': 'The next status must be a valid registred status',
	};
}
