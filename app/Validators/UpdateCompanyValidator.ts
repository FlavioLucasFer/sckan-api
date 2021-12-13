import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateCompanyValidator {
  constructor(protected ctx: HttpContextContract) {}

	private table = 'companies';

	public schema = schema.create({
		name: schema.string.optional({ trim: true }, [
			rules.maxLength(255),
			rules.unique({ table: this.table, column: 'name' }),
		]),

		tradeName: schema.string.optional({ trim: true }, [
			rules.maxLength(255),
			rules.unique({ table: this.table, column: 'trade_name' }),
		]),

		email: schema.string.optional({ trim: true }, [
			rules.email(),
			rules.maxLength(255),
			rules.unique({ table: this.table, column: 'email' }),
		]),
	})

	public messages = {
		required: 'The {{ field }} field is required to create new company.',
		email: 'The email field must be a valid e-mail.',
		unique: 'Already has an company with this {{ field }}. {{ field }} field must be unique.',
		maxLength: 'Max length for {{ field }} field is {{ options.maxLength }} chars.',
	}
}
