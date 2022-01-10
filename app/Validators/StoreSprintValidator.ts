import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { schema, rules } from '@ioc:Adonis/Core/Validator';
import { DateTime } from 'luxon';

export default class StoreSprintValidator {
  constructor(protected ctx: HttpContextContract) {};

	public refs = schema.refs({
		allowedDate: DateTime.local().minus({ days: 1 }),
	});

  public schema = schema.create({
		name: schema.string.nullableAndOptional({ trim: true }, [
			rules.maxLength(50),
			rules.uniqueCompound('sprints', 'name', ['project_id'], ['project'])
		]),

		description: schema.string.nullableAndOptional({ trim: true }, [
			rules.maxLength(255),
		]),
		
		startsAt: schema.date({ format: 'yyyy-MM-dd HH:mm:ss' }, [
			rules.after(this.refs.allowedDate),
		]),

		endsAt: schema.date({ format: 'yyyy-MM-dd HH:mm:ss' }, [
			rules.after(this.refs.allowedDate),
		]),

		startedAt: schema.date.nullableAndOptional({ format: 'yyyy-MM-dd HH:mm:ss' }),

		endedAt: schema.date.nullableAndOptional({ format: 'yyyy-MM-dd HH:mm:ss' }),

		project: schema.number([
			rules.unsigned(),
			rules.exists({ table: 'projects', column: 'id' }),
		]), 
	});

  public messages = {
		required: 'The {{ field }} field is required to create new sprint',
		'name.uniqueCompound': 'Already has an sprint with this name on this project. Name field must be unique',
		maxLength: 'Max length for {{ field }} field is {{ options.maxLength }} chars',
		'project.exists': 'The project must be a valid registred project',
		after: 'The {{ field }} date must be today or after',
	};
}
