import type { Queries, Row } from 'tinybase/with-schemas';

import type { StoreSchema } from '../store-config';
import { createQuerySetter, selectAll } from './utils';

type JoinedCurrency = {
  [Key in keyof Row<
    StoreSchema[0],
    'currencies'
  > as `currency${Capitalize<Key>}`]: Row<StoreSchema[0], 'currencies'>[Key];
};
export type UserWalletsQueryResult = Row<StoreSchema[0], 'wallets'> &
  JoinedCurrency;

export function isPopulatedCurrencyDefined(
  currency: JoinedCurrency
): currency is Required<Omit<JoinedCurrency, 'currencyUserId'>> & {
  currencyUserId: JoinedCurrency['currencyUserId'];
} {
  return (
    typeof currency.currencyCode !== 'undefined' &&
    typeof currency.currencyDecimalPlaces !== 'undefined' &&
    typeof currency.currencyIsISO !== 'undefined' &&
    typeof currency.currencyName !== 'undefined' &&
    typeof currency.currencyType !== 'undefined'
  );
}

export function setUserWalletsQuery(
  queries: Queries<StoreSchema>,
  userId: string,
  populateWith: { currency: boolean } = { currency: false },
  ...keys: string[]
) {
  return createQuerySetter<StoreSchema, 'wallets'>('wallets', () => ({
    queryKeys: [setUserWalletsQuery.name, userId, ...keys],
    queryDefinition: ({ select, where, join }) => {
      selectAll(select, 'wallets');
      where('userId', userId);
      if (populateWith.currency) {
        selectAll(select, 'currencies', 'currency', 'currency');
        join('currencies', 'currencyId').as('currency');
      }
    },
  }))(queries);
}

export function setWalletsByFilterQuery(
  queries: Queries<StoreSchema>,
  filterBy: { name?: string; currencyId?: string; userId?: string },
  ...keys: string[]
) {
  return createQuerySetter<StoreSchema, 'wallets'>('wallets', () => ({
    queryKeys: [setWalletsByFilterQuery.name, filterBy, ...keys],
    queryDefinition: ({ select, where }) => {
      selectAll(select, 'wallets');
      if (filterBy.name) where('name', filterBy.name);
      if (filterBy.userId) where('userId', filterBy.userId);
      if (filterBy.currencyId) where('currencyId', filterBy.currencyId);
    },
  }))(queries);
}
