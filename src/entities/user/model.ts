import {
  nonempty,
  object,
  size,
  string,
  trimmed,
  type Describe,
  type Infer,
} from 'superstruct';
import type { Row } from 'tinybase/with-schemas';

import { useResultTable, useRow, useValue } from '~/shared/lib/tiny-base';
import {
  queries,
  store,
  type StoreSchema,
  type storeTablesSchema,
} from '~/store';
import { setUsersQuery } from '~/store/queries/user';

type StoredUser = Row<typeof storeTablesSchema, 'users'>;

export const USER_NAME_MAX_LENGTH = 100;

export const CreatedUserScheme: Describe<StoredUser> = object({
  name: nonempty(size(trimmed(string()), 0, USER_NAME_MAX_LENGTH)),
});

export type CreatedUser = Infer<typeof CreatedUserScheme>;

// TODO: refactor this errors type for all models
export type CreatedUserErrors = {
  [Key in keyof CreatedUser]?: string;
};

export function useCurrentUserId() {
  return useValue({ store, valueId: () => 'userId' });
}

export function useCurrentUser() {
  const userId = useCurrentUserId();
  return useRow({ store, tableId: () => 'users', rowId: userId });
}

export function useUsers() {
  const usersQuery = setUsersQuery();
  return useResultTable<Record<string, StoredUser>, StoreSchema>({
    queries,
    queryId: () => usersQuery.queryId,
  });
}
