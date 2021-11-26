declare module '@ioc:Adonis/Lucid/Database' {
	interface DatabaseQueryBuilderContract<Result> {
		withTrashed(): DatabaseQueryBuilderContract<Result>
		onlyTrashed(): DatabaseQueryBuilderContract<Result>
	}
}

declare module '@ioc:Adonis/Lucid/Orm' {
	interface ModelQueryBuilderContract<
		Model extends LucidModel,
		Result = InstanceType<Model>
	> {
		withTrashed(): ModelQueryBuilderContract<Model, Result>
		onlyTrashed(): ModelQueryBuilderContract<Model, Result>
	}
}
