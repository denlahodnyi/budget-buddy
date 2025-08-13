import type { Queries, Row } from 'tinybase/with-schemas';

import { type StoreSchema } from '../store-config';
import type { QueryKeys, RowWithPrefixedCellIds } from './util-types';
import { createQuerySetter, selectAll } from './utils';

export const setWalletTransactionsQuery = (
  queries: Queries<StoreSchema>,
  walletId: string,
  ...keys: QueryKeys
) => {
  return createQuerySetter<StoreSchema, 'transactions'>('transactions', () => ({
    queryKeys: [setWalletTransactionsQuery.name, walletId, ...keys],
    queryDefinition: ({ select, where, join }) => {
      selectAll(select, 'transactions');
      where('walletId', walletId);
      join('wallets', 'walletId').as('wallet');
    },
  }))(queries);
};

const PopulatedWalletFieldsPrefix = 'wallet';
const PopulatedCategoryFieldsPrefix = 'category';
const PopulatedCurrencyFieldsPrefix = 'currency';

export type UserTransactionsQueryResultRow<
  WithWallet = boolean,
  WithCategory = boolean,
  WithCurrency = boolean
> = Row<StoreSchema[0], 'transactions'> &
  ((WithWallet extends true
    ? RowWithPrefixedCellIds<
        'wallets',
        `${typeof PopulatedWalletFieldsPrefix}.`
      >
    : object) &
    (WithCategory extends true
      ? RowWithPrefixedCellIds<
          'categories',
          `${typeof PopulatedCategoryFieldsPrefix}.`
        >
      : object) &
    (WithCurrency extends true
      ? RowWithPrefixedCellIds<
          'currencies',
          `${typeof PopulatedCurrencyFieldsPrefix}.`
        >
      : object));

export type UserTransactionsQueryResultTransformedRow = Row<
  StoreSchema[0],
  'transactions'
> & {
  wallet: null | Row<StoreSchema[0], 'wallets'>;
  category: null | Row<StoreSchema[0], 'categories'>;
  currency: null | Row<StoreSchema[0], 'currencies'>;
};

export function setUserTransactionsQuery(
  queries: Queries<StoreSchema>,
  userId: string,
  populateWith: { wallet: boolean; category: boolean; currency: boolean } = {
    wallet: false,
    category: false,
    currency: false,
  },
  ...keys: QueryKeys
) {
  return createQuerySetter<StoreSchema, 'transactions'>('transactions', () => ({
    queryKeys: [setUserTransactionsQuery.name, userId, populateWith, ...keys],
    queryDefinition: ({ select, where, join }) => {
      selectAll(select, 'transactions');
      where('userId', userId);

      if (populateWith.wallet) {
        selectAll(
          select,
          'wallets',
          'joinedWallet',
          PopulatedWalletFieldsPrefix
        );
        join('wallets', 'walletId').as('joinedWallet');

        if (populateWith.currency) {
          selectAll(
            select,
            'currencies',
            'joinedCur',
            PopulatedCurrencyFieldsPrefix
          );
          join('currencies', 'joinedWallet', 'currencyId').as('joinedCur');
        }
      }
      if (populateWith.category) {
        selectAll(
          select,
          'categories',
          'joinedCat',
          PopulatedCategoryFieldsPrefix
        );
        join('categories', 'categoryId').as('joinedCat');
      }
    },
  }))(queries);
}
setUserTransactionsQuery.transformResult = <
  WithWallet extends boolean = true,
  WithCategory extends boolean = true,
  WithCurrency extends boolean = true
>(
  data: UserTransactionsQueryResultRow<WithWallet, WithCategory, WithCurrency>
) => {
  const res: UserTransactionsQueryResultTransformedRow = {
    wallet: null,
    category: null,
    currency: null,
    amount: 0,
    createdAt: 0,
    type: '',
  };
  Object.entries(data).forEach(([key, val]) => {
    if (key.indexOf(`${PopulatedWalletFieldsPrefix}.`) !== -1) {
      const [, subkey] = key.split('.');

      type Wallet = NonNullable<
        UserTransactionsQueryResultTransformedRow['wallet']
      >;

      if (res.wallet) {
        const wallet = { [subkey]: val, ...res.wallet };
        res.wallet = wallet as Wallet;
      } else {
        res.wallet = { [subkey]: val } as Wallet;
      }
    } else if (key.indexOf(`${PopulatedCategoryFieldsPrefix}.`) !== -1) {
      const [, subkey] = key.split('.');

      type Cat = NonNullable<
        UserTransactionsQueryResultTransformedRow['category']
      >;

      if (res.category) {
        const category = { [subkey]: val, ...res.category };
        res.category = category as Cat;
      } else {
        res.category = { [subkey]: val } as Cat;
      }
    } else if (key.indexOf(`${PopulatedCurrencyFieldsPrefix}.`) !== -1) {
      const [, subkey] = key.split('.');

      type Cur = NonNullable<
        UserTransactionsQueryResultTransformedRow['currency']
      >;

      if (res.currency) {
        const currency = { [subkey]: val, ...res.currency };
        res.currency = currency as Cur;
      } else {
        res.currency = { [subkey]: val } as Cur;
      }
    } else {
      type OtherKeys = keyof UserTransactionsQueryResultTransformedRow;
      (res[key as OtherKeys] as unknown) = val as unknown;
    }
  });

  return res;
};

export type TransactionsPerCatQueryResult = Partial<{
  id: string;
  total: number;
}>;

export function setTransactionsCountPerCategoryQuery(
  queries: Queries<StoreSchema>,
  categoryIds: string[],
  ...keys: QueryKeys
) {
  return createQuerySetter<StoreSchema, 'transactions'>('transactions', () => ({
    queryKeys: [
      setTransactionsCountPerCategoryQuery.name,
      ...categoryIds,
      ...keys,
    ],
    queryDefinition: ({ select, group, where }) => {
      select('categoryId').as(
        'id' satisfies keyof TransactionsPerCatQueryResult
      );
      select('categoryId');
      group('categoryId', 'count').as(
        'total' satisfies keyof TransactionsPerCatQueryResult
      );
      where((getCell) => {
        const catId = getCell('categoryId');
        return catId ? categoryIds.includes(catId) : false;
      });
    },
  }))(queries);
}

export type TransactionsPerWalletQueryResult = Partial<{
  id: string;
  total: number;
}>;

export function setTransactionsCountPerWalletQuery(
  queries: Queries<StoreSchema>,
  walletIds: string[],
  ...keys: QueryKeys
) {
  return createQuerySetter<StoreSchema, 'transactions'>('transactions', () => ({
    queryKeys: [setTransactionsCountPerWalletQuery.name, ...walletIds, ...keys],
    queryDefinition: ({ select, group, where }) => {
      select('walletId').as(
        'id' satisfies keyof TransactionsPerWalletQueryResult
      );
      select('walletId');
      group('walletId', 'count').as(
        'total' satisfies keyof TransactionsPerWalletQueryResult
      );
      where((getCell) => {
        const walletId = getCell('walletId');
        return walletId ? walletIds.includes(walletId) : false;
      });
    },
  }))(queries);
}
