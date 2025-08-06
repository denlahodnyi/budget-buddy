import type { Queries } from 'tinybase/with-schemas';

import type { StoreSchema } from '../store-config';
import type { QueryKeys } from './util-types';
import { createQuerySetter, selectAll } from './utils';

export function setUserFullCurrencies(
  queries: Queries<StoreSchema>,
  userId: string,
  ...keys: QueryKeys
) {
  return createQuerySetter<StoreSchema, 'currencies'>('currencies', () => ({
    queryKeys: [setUserFullCurrencies.name, userId, ...keys],
    queryDefinition: ({ select, where, join }) => {
      selectAll(select, 'currencies');
      select('customRate', 'rate').as('userRate');
      join('userExchangeRates', (getCell) => `${userId}_${getCell('code')}`).as(
        'customRate'
      );
      where((getCell) => !getCell('userId') || getCell('userId') === userId);
    },
  }))(queries);
}
