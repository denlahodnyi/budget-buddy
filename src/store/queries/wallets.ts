import type { Queries, Row } from 'tinybase/with-schemas';

import type { StoreSchema } from '../store-config';
import type { RowWithPrefixedCellIds } from './util-types';
import { createQuerySetter, selectAll } from './utils';

const PopulatedCurrencyFieldsPrefix = 'currency';

type WalletsRow = Row<StoreSchema[0], 'wallets'>;

export type UserWalletsQueryResultRow<WithCurrency = boolean> = WalletsRow &
  (WithCurrency extends true
    ? RowWithPrefixedCellIds<
        'currencies',
        `${typeof PopulatedCurrencyFieldsPrefix}.`
      >
    : object);

export type UserWalletsQueryResultTransformedRow = WalletsRow & {
  currency: null | Row<StoreSchema[0], 'currencies'>;
};

export function setUserWalletsQuery(
  queries: Queries<StoreSchema>,
  userId: string,
  populateWith: { currency: boolean } = { currency: false },
  ...keys: string[]
) {
  return createQuerySetter<StoreSchema, 'wallets'>('wallets', () => ({
    queryKeys: [setUserWalletsQuery.name, userId, populateWith, ...keys],
    queryDefinition: ({ select, where, join }) => {
      selectAll(select, 'wallets');
      where('userId', userId);

      if (populateWith.currency) {
        selectAll(
          select,
          'currencies',
          'joinedCur',
          PopulatedCurrencyFieldsPrefix
        );
        join('currencies', 'currencyId').as('joinedCur');
      }
    },
  }))(queries);
}
setUserWalletsQuery.transformResult = (row: UserWalletsQueryResultRow) => {
  const result: UserWalletsQueryResultTransformedRow = {
    currency: null,
    createdAt: '',
    currencyId: '',
    name: '',
    userId: '',
  };
  Object.entries(row).forEach(([key, val]) => {
    if (key.indexOf(`${PopulatedCurrencyFieldsPrefix}.`) !== -1) {
      const [, subkey] = key.split('.');

      type Currency = NonNullable<
        UserWalletsQueryResultTransformedRow['currency']
      >;

      if (result.currency) {
        const currency = { [subkey]: val, ...result.currency };
        result.currency = currency as Currency;
      } else {
        result.currency = { [subkey]: val } as Currency;
      }
    } else {
      type OtherKeys = keyof UserWalletsQueryResultTransformedRow;

      (result[key as OtherKeys] as unknown) = val as unknown;
    }
  });

  return result;
};

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
