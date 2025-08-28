import type { Queries } from 'tinybase/with-schemas';

import { TRANSACTION_TYPES, type StoreSchema } from '../store-config';
import type { QueryKeys } from './util-types';
import { createQuerySetter } from './utils';

export type TotalExpenseByWalletQueryResult = Partial<{
  totalExpense: number;
}>;

export function setTotalExpenseByWalletQuery(
  queries: Queries<StoreSchema>,
  walletId: string,
  ...keys: QueryKeys
) {
  return createQuerySetter<StoreSchema, 'transactions'>('transactions', () => ({
    queryKeys: [setTotalExpenseByWalletQuery.name, walletId, ...keys],
    queryDefinition: ({ select, where, group }) => {
      select('amount');
      where('walletId', walletId);
      where('type', TRANSACTION_TYPES.EXPENSE);
      group('amount', 'sum').as(
        'totalExpense' satisfies keyof TotalExpenseByWalletQueryResult
      );
    },
  }))(queries);
}

export type UserExpenseQueryResult = {
  totalExpense: number;
  code: string;
  walletId: string;
};

export function setUserExpenseQuery(
  queries: Queries<StoreSchema>,
  userId: string,
  filterBy?: { startDate?: number; endDate?: number },
  ...keys: QueryKeys
) {
  return createQuerySetter<StoreSchema, 'transactions'>('transactions', () => ({
    queryKeys: [setUserExpenseQuery.name, userId, filterBy, ...keys],
    queryDefinition: ({ select, where, group, join }) => {
      select('amount');
      select('walletId');
      select('currency', 'code');
      where('userId', userId);
      where('type', TRANSACTION_TYPES.EXPENSE);
      if (filterBy?.startDate) {
        where((getCell) => getCell('createdAt')! >= filterBy.startDate!);
      }
      if (filterBy?.endDate) {
        where((getCell) => getCell('createdAt')! <= filterBy.endDate!);
      }
      group('amount', 'sum').as(
        'totalExpense' satisfies keyof UserExpenseQueryResult
      );
      join('wallets', 'walletId');
      join('currencies', 'wallets', 'currencyId').as('currency');
    },
  }))(queries);
}
