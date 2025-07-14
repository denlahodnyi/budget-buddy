import type {
  Group,
  Having,
  Join,
  OptionalSchemas,
  Queries,
  Select,
  Where,
} from 'tinybase/with-schemas';

import type { TableIdFromSchema } from '~/shared/lib/tiny-base';
import { storeTablesSchema } from '../store-config';
import type { QueryKeys } from './util-types';

type SetQueryDefArgs = Parameters<
  Queries<OptionalSchemas>['setQueryDefinition']
>;

type QueryDefFnArg = Parameters<SetQueryDefArgs[2]>[0];

// This type is used to remap the query definition arguments so that they see
// correct table id. It works correctly only inside setQueryDefinition, but we
// pass the callback separately, so we need to remap it.
type QueryReMap<
  TSchemas extends OptionalSchemas,
  TTableId extends TableIdFromSchema<TSchemas[0]>
> = Parameters<Queries<TSchemas>['setQueryDefinition']>[2] extends (
  args: infer TArgs extends QueryDefFnArg
) => void
  ? (args: {
      [K in keyof TArgs]: K extends 'select'
        ? Select<TSchemas[0], TTableId>
        : K extends 'join'
        ? Join<TSchemas[0], TTableId>
        : K extends 'where'
        ? Where<TSchemas[0], TTableId>
        : K extends 'group'
        ? Group
        : K extends 'having'
        ? Having
        : never;
    }) => void
  : never;

export function createQuerySetter<
  TSchemas extends OptionalSchemas,
  TTableId extends TableIdFromSchema<TSchemas[0]>
>(
  tableId: TTableId,
  queryFn: () => {
    queryKeys: QueryKeys;
    queryDefinition: QueryReMap<TSchemas, TTableId>;
  }
) {
  return (queries: Queries<TSchemas>) => {
    const { queryKeys, queryDefinition } = queryFn();
    const queryId = JSON.stringify(queryKeys);
    const qRef = queries.setQueryDefinition(queryId, tableId, queryDefinition);
    return { queryId, queries: qRef };
  };
}

export function selectAll<TTableId extends keyof typeof storeTablesSchema>(
  select: Select<typeof storeTablesSchema, TTableId>,
  tableId: TTableId
) {
  Object.keys(storeTablesSchema[tableId]).forEach((field) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    select(field as any)
  );
}
