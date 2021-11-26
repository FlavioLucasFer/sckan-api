import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
    // Register your own bindings
  }

  public async boot() {
    const { 
			DatabaseQueryBuilder,
			ModelQueryBuilder, 
		} = this.app.container.use('Adonis/Lucid/Database');

		DatabaseQueryBuilder.macro('withTrashed', function () {
			this.whereRaw('(deleted_at IS NULL or deleted_at IS NOT NULL)');

			return this;
		});

		DatabaseQueryBuilder.macro('onlyTrashed', function () {
			this.whereNotNull('deleted_at');

			return this;
		});

		ModelQueryBuilder.macro('withTrashed', function () {
			this.whereRaw('(deleted_at IS NULL or deleted_at IS NOT NULL)');

			return this;
		});

		ModelQueryBuilder.macro('onlyTrashed', function () {
			this.whereNotNull('deleted_at');

			return this;
		});
  }

  public async ready() {
    // App is ready
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
