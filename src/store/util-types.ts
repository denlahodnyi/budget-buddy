import type { Queries } from 'tinybase/with-schemas';

import type { storeTablesSchema, storeValuesSchema } from './store-config';

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

export type QueriesWithSchemas = Queries<
  [typeof storeTablesSchema, typeof storeValuesSchema]
>;
