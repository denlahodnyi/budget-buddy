import type { Queries } from 'tinybase/with-schemas';

import { TRANSACTION_TYPES, type StoreSchema } from '../store-config';
import type { QueryKeys } from './util-types';
import { createQuerySetter } from './utils';

export type TotalIncomeByWalletQueryResult = Partial<{
  totalIncome: number;
}>;

export function setTotalIncomeByWalletQuery(
  queries: Queries<StoreSchema>,
  walletId: string,
  ...keys: QueryKeys
) {
  return createQuerySetter<StoreSchema, 'transactions'>('transactions', () => ({
    queryKeys: [setTotalIncomeByWalletQuery.name, walletId, ...keys],
    queryDefinition: ({ select, where, group }) => {
      select('amount');
      where('walletId', walletId);
      where('type', TRANSACTION_TYPES.INCOME);
      group('amount', 'sum').as(
        'totalIncome' satisfies keyof TotalIncomeByWalletQueryResult
      );
    },
  }))(queries);
}

export type UserIncomeQueryResult = {
  totalIncome: number;
  code: string;
  walletId: string;
};

export function setUserIncomeQuery(
  queries: Queries<StoreSchema>,
  userId: string,
  ...keys: QueryKeys
) {
  return createQuerySetter<StoreSchema, 'transactions'>('transactions', () => ({
    queryKeys: [setUserIncomeQuery.name, userId, ...keys],
    queryDefinition: ({ select, where, group, join }) => {
      select('amount');
      select('walletId');
      select('currency', 'code');
      where('userId', userId);
      where('type', TRANSACTION_TYPES.INCOME);
      group('amount', 'sum').as(
        'totalIncome' satisfies keyof UserIncomeQueryResult
      );
      join('wallets', 'walletId');
      join('currencies', 'wallets', 'currencyId').as('currency');
    },
  }))(queries);
}
