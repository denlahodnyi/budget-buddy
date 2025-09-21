import type { Queries } from 'tinybase/with-schemas';

import { setStartOfDay } from '~/shared/lib/dates';
import { TRANSACTION_TYPES, type StoreSchema } from '../store-config';
import type { QueryKeys } from './util-types';
import { createQuerySetter } from './utils';

export type TotalIncomeByWalletQueryResult = Partial<{
  totalIncome: number;
}>;

/**
 * Query income by wallet
 */
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

/**
 * Query income grouped by currency. Can be filtered by dates interval
 */
export function setUserIncomeQuery(
  queries: Queries<StoreSchema>,
  userId: string,
  filterBy?: { startDate?: number; endDate?: number },
  ...keys: QueryKeys
) {
  return createQuerySetter<StoreSchema, 'transactions'>('transactions', () => ({
    queryKeys: [setUserIncomeQuery.name, userId, filterBy, ...keys],
    queryDefinition: ({ select, where, group, join }) => {
      select('amount');
      select('walletId');
      select('currency', 'code');
      where('userId', userId);
      where('type', TRANSACTION_TYPES.INCOME);
      if (filterBy?.startDate) {
        where((getCell) => getCell('createdAt')! >= filterBy.startDate!);
      }
      if (filterBy?.endDate) {
        where((getCell) => getCell('createdAt')! <= filterBy.endDate!);
      }
      group('amount', 'sum').as(
        'totalIncome' satisfies keyof UserIncomeQueryResult
      );
      join('wallets', 'walletId');
      join('currencies', 'wallets', 'currencyId').as('currency');
    },
  }))(queries);
}

export type UserIncomeByDateQueryResult = {
  totalIncome: number;
  code: string;
  walletId: string;
  date: number;
};

/**
 * Query income grouped by dates (same day, month or year) and currency. Can be
 * filtered by dates interval
 */
export function setUserIncomeByDateQuery(
  queries: Queries<StoreSchema>,
  userId: string,
  dateGroup: 'day' | 'month' | 'year' = 'day',
  filterBy?: { startDate?: number; endDate?: number },
  ...keys: QueryKeys
) {
  return createQuerySetter<StoreSchema, 'transactions'>('transactions', () => ({
    queryKeys: [setUserIncomeQuery.name, userId, filterBy, ...keys],
    queryDefinition: ({ select, where, group, join }) => {
      select('amount');
      select('walletId');
      select('currency', 'code');
      select((getTableCell) => {
        const date = new Date(getTableCell('createdAt') as number);
        if (dateGroup === 'year') {
          date.setMonth(0);
          date.setDate(1);
        } else if (dateGroup === 'month') {
          date.setDate(1);
        }
        return setStartOfDay(date).getTime();
      }).as('date');
      where('userId', userId);
      where('type', TRANSACTION_TYPES.INCOME);
      if (filterBy?.startDate) {
        where((getCell) => getCell('createdAt')! >= filterBy.startDate!);
      }
      if (filterBy?.endDate) {
        where((getCell) => getCell('createdAt')! <= filterBy.endDate!);
      }
      group('amount', 'sum').as(
        'totalIncome' satisfies keyof UserIncomeByDateQueryResult
      );
      join('wallets', 'walletId');
      join('currencies', 'wallets', 'currencyId').as('currency');
    },
  }))(queries);
}
