import type { Queries } from 'tinybase/with-schemas';

import { TRANSACTION_TYPES, type StoreSchema } from '../store-config';
import type { QueryKeys } from './util-types';
import { createQuerySetter } from './utils';

export type TotalBalanceByWalletQueryResult = Partial<{
  totalBalance: number;
}>;

export function setTotalBalanceByWalletQuery(
  queries: Queries<StoreSchema>,
  walletId: string,
  ...keys: QueryKeys
) {
  return createQuerySetter<StoreSchema, 'transactions'>('transactions', () => ({
    queryKeys: [setTotalBalanceByWalletQuery.name, walletId, ...keys],
    queryDefinition: ({ select, where, group }) => {
      select((getCell) => {
        return getCell('type') === TRANSACTION_TYPES.INCOME
          ? getCell('amount')
          : -getCell('amount')!;
      }).as('amountWithSign');
      where('walletId', walletId);
      group('amountWithSign', 'sum').as(
        'totalBalance' satisfies keyof TotalBalanceByWalletQueryResult
      );
    },
  }))(queries);
}

export type UserBalanceQueryResult = Partial<{
  totalBalance: number;
}>;

export function setUserBalanceQuery(
  queries: Queries<StoreSchema>,
  userId: string,
  ...keys: QueryKeys
) {
  return createQuerySetter<StoreSchema, 'transactions'>('transactions', () => ({
    queryKeys: [setUserBalanceQuery.name, userId, ...keys],
    queryDefinition: ({ select, where, group }) => {
      select((getCell) => {
        return getCell('type') === TRANSACTION_TYPES.INCOME
          ? getCell('amount')
          : -getCell('amount')!;
      }).as('amountWithSign');
      where('userId', userId);
      group('amountWithSign', 'sum').as(
        'totalBalance' satisfies keyof UserBalanceQueryResult
      );
    },
  }))(queries);
}
