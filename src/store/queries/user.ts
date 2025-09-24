import { queries } from '..';
import type { StoreSchema } from '../store-config';
import { createQuerySetter, selectAll } from './utils';

export function setUsersQuery(...keys: string[]) {
  return createQuerySetter<StoreSchema, 'users'>('users', () => ({
    queryKeys: [setUsersQuery.name, ...keys],
    queryDefinition: ({ select }) => {
      selectAll(select, 'users');
    },
  }))(queries);
}
