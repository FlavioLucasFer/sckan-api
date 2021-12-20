import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class StoreUserValidator {
  constructor(protected ctx: HttpContextContract) {}

	private table = 'users';

	public schema = schema.create({
		company: schema.number([
			rules.unsigned(),
			rules.exists({ table: 'companies', column: 'id' }),
		]),

		role: schema.string({ trim: true }, [
			rules.exists({ table: 'roles', column: 'id' }),
		]),

		name: schema.string({ trim: true }, [
			rules.maxLength(255),
		]),

		username: schema.string({ trim: true }, [
			rules.maxLength(255),
			rules.unique({ table: this.table, column: 'username' }),
			rules.regex(/^[a-zA-Z0-9 ]+$/),
		]),
		
		password: schema.string({ trim: true }, [
			rules.minLength(8),
			rules.maxLength(255),
			rules.confirmed('passwordConfirmation'),
			rules.regex(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/),
		]),

		email: schema.string({ trim: true }, [
			rules.email(),
			rules.maxLength(255),
			rules.unique({ table: this.table, column: 'email' }),
		]),
	})

	public messages = {
		required: 'The {{ field }} field is required to create new user.',
		email: 'The email field must be a valid e-mail.',
		unique: 'Already has an user with this {{ field }}. {{ field }} field must be unique.',
		maxLength: 'Max length for {{ field }} field is {{ options.maxLength }} chars.',
		'company.exists': 'The company must be a valid registred company.',
		'role.exists': 'The role must be a valid registred role.',
		'username.regex': 'The username must have only letters and numbers',
		'password.minLength': 'The password must be at least 8 characters long.',
		'password.regex': 'The password must have at least one number, one lower case letter and one upper case letter.',
		'passwordConfirmation.confirmed': "The password and it's confirmation don't match.",
	}
}
