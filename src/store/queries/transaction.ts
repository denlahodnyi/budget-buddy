import type { Queries } from 'tinybase/with-schemas';

import { type StoreSchema } from '../store-config';
import type { QueryKeys } from './util-types';
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

export function setUserTransactionsQuery(
  queries: Queries<StoreSchema>,
  userId: string,
  ...keys: QueryKeys
) {
  return createQuerySetter<StoreSchema, 'transactions'>('transactions', () => ({
    queryKeys: [setUserTransactionsQuery.name, userId, ...keys],
    queryDefinition: ({ select, where, join }) => {
      selectAll(select, 'transactions');
      where('userId', userId);
      join('wallets', 'walletId').as('wallet');
    },
  }))(queries);
}

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
