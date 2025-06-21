type QueryResultFieldsTypes<TTQueryFieldsMap extends Record<string, unknown>> =
  {
    [T in keyof TTQueryFieldsMap]: TTQueryFieldsMap[T] extends infer A
      ? A
      : unknown;
  };

export type QueryResult<
  TQueryFieldsMap extends Record<string, string>,
  TQueryFieldsTypesMap extends QueryResultFieldsTypes<
    Record<keyof TQueryFieldsMap, unknown>
  >
> = {
  [T in keyof TQueryFieldsMap as TQueryFieldsMap[T]]: TQueryFieldsTypesMap[T];
};
