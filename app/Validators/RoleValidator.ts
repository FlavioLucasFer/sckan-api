import { schema, rules } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class RoleValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
		name: schema.string({ trim: true }, [ 
			rules.unique({ table: 'roles', column: 'name' }),
			rules.maxLength(50), 
		]),
	})

  public messages = {
		required: 'The {{ field }} field is required to create new role.',
		'name.unique': 'Already has an role with this name. Name field must be unique.',
		'name.maxLength': 'Max length for name field is {{ options.maxLength }} chars.',
	}
}
