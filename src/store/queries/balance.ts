import type { Queries } from 'tinybase/with-schemas';

import { TRANSACTION_TYPES, type StoreSchema } from '../store-config';
import type { QueryKeys } from './util-types';
import { createQuerySetter } from './utils';

export type TotalBalanceByWalletQueryResult = Partial<{
  totalBalance: number;
  code: string;
}>;

export function setTotalBalanceByWalletQuery(
  queries: Queries<StoreSchema>,
  walletId: string,
  ...keys: QueryKeys
) {
  return createQuerySetter<StoreSchema, 'transactions'>('transactions', () => ({
    queryKeys: [setTotalBalanceByWalletQuery.name, walletId, ...keys],
    queryDefinition: ({ select, where, group, join }) => {
      select((getCell) => {
        return getCell('type') === TRANSACTION_TYPES.INCOME
          ? getCell('amount')
          : -getCell('amount')!;
      }).as('amountWithSign');
      select('currency', 'code');
      where('walletId', walletId);
      group('amountWithSign', 'sum').as(
        'totalBalance' satisfies keyof TotalBalanceByWalletQueryResult
      );
      join('wallets', 'walletId');
      join('currencies', 'wallets', 'currencyId').as('currency');
    },
  }))(queries);
}

export type UserBalanceQueryResult = {
  totalBalance: number;
  code: string;
  walletId: string;
};

export function setUserBalanceQuery(
  queries: Queries<StoreSchema>,
  userId: string,
  ...keys: QueryKeys
) {
  return createQuerySetter<StoreSchema, 'transactions'>('transactions', () => ({
    queryKeys: [setUserBalanceQuery.name, userId, ...keys],
    queryDefinition: ({ select, where, group, join }) => {
      select((getCell) => {
        return getCell('type') === TRANSACTION_TYPES.INCOME
          ? getCell('amount')
          : -getCell('amount')!;
      }).as('amountWithSign');
      select('walletId');
      select('currency', 'code');
      where('userId', userId);
      group('amountWithSign', 'sum').as(
        'totalBalance' satisfies keyof UserBalanceQueryResult
      );
      join('wallets', 'walletId');
      join('currencies', 'wallets', 'currencyId').as('currency');
    },
  }))(queries);
}
