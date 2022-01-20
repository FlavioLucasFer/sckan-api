import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { schema, rules } from '@ioc:Adonis/Core/Validator';

export default class AttachTaskLabelValidator {
  constructor(protected ctx: HttpContextContract) {};

  public schema = schema.create({
		task: schema.number([
			rules.unsigned(),
			rules.exists({ table: 'tasks', column: 'id' }),
		]),
		
		label: schema.number([
			rules.unsigned(),
			rules.exists({ table: 'labels', column: 'id' }),
			rules.uniqueCompound('task_labels', 'label_id', ['task_id'], ['task'], 'task_id'),
		]),
	});

  public messages = {
		required: 'The {{ field }} field is required to attach label to task',
		exists: 'The {{ field }} must be a valid registred {{ field }}',
		uniqueCompound: 'This label is already attached with this task',
	};
}
