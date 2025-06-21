import type { Id } from 'tinybase';
import type {
  OptionalTablesSchema,
  OptionalValuesSchema,
  Queries,
  ResultRow,
} from 'tinybase/with-schemas';

export type AsId<Key> = Exclude<Key & Id, number>;

export type TableIdFromSchema<Schema extends OptionalTablesSchema> = AsId<
  keyof Schema
>;

export type ValueIdFromSchema<Schema extends OptionalValuesSchema> = AsId<
  keyof Schema
>;

export type MaybeUndefinedResultRow = {
  [T in keyof ResultRow]?: ResultRow[T];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SchemaFromQueries<T extends Queries<any>> = T extends Queries<
  infer TSchemas
>
  ? TSchemas
  : never;
