import { schema, rules } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class LoginValidator {
  constructor(protected ctx: HttpContextContract) {};

  public schema = schema.create({
		username: schema.string({ trim: true }, [
			rules.maxLength(255),
		]),
		password: schema.string({ trim: true }, [
			rules.maxLength(255),
		]),
	});

  public messages = {
		required: 'The {{ field }} field is required to login.',
		maxLength: 'Max length for {{ field }} field is {{ options.maxLength }} chars.',
	};
}
