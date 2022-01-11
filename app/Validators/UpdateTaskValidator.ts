import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { schema, rules } from '@ioc:Adonis/Core/Validator';

export default class UpdateTaskValidator {
	constructor(protected ctx: HttpContextContract) {};

	public schema = schema.create({
		name: schema.string.optional({ trim: true }, [
			rules.maxLength(255),
		]),

		description: schema.string.optional({ trim: true }, [
			rules.maxLength(500),
		]),

		plannedSize: schema.number.optional(),

		size: schema.number.optional(),

		timeSpent: schema.date.optional({
			format: 'HH:mm:ss',
		}),

		issueUrl: schema.string.nullableAndOptional({ trim: true }, [
			rules.url(),
		]),

		user: schema.number.optional([
			rules.exists({ table: 'users', column: 'id' }),
		]),

		sprint: schema.number.optional([
			rules.exists({ table: 'sprints', column: 'id' }),
		]),

		status: schema.number.optional([
			rules.exists({ table: 'statuses', column: 'id' }),
		]),

		priority: schema.number.optional([
			rules.exists({ table: 'priorities', column: 'id' }),
		]),
	});

	public messages = {
		required: 'The {{ field }} field is required to create new task',
		maxLength: 'Max length for {{ field }} field is {{ options.maxLength }} chars',
		url: 'The {{ field }} must be a valid URL',
		exists: 'The {{ field }} must be a valid registred {{ field }}',
	};
}
