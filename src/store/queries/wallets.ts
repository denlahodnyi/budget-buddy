import type { Queries } from 'tinybase/with-schemas';

import type { StoreSchema } from '../store-config';
import { createQuerySetter, selectAll } from './utils';

export function setUserWalletsQuery(
  queries: Queries<StoreSchema>,
  userId: string,
  ...keys: string[]
) {
  return createQuerySetter<StoreSchema, 'wallets'>('wallets', () => ({
    queryKeys: [setUserWalletsQuery.name, userId, ...keys],
    queryDefinition: ({ select, where }) => {
      selectAll(select, 'wallets');
      where('userId', userId);
    },
  }))(queries);
}
