import type { Queries } from 'tinybase/with-schemas';

import { setStartOfDay } from '~/shared/lib/dates';
import { TRANSACTION_TYPES, type StoreSchema } from '../store-config';
import type { QueryKeys } from './util-types';
import { createQuerySetter } from './utils';

export type TotalExpenseByWalletQueryResult = Partial<{
  totalExpense: number;
}>;

/**
 * Query expense grouped by wallet
 */
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
  category: string;
  categoryColor: string;
};

/**
 * Query expense grouped by currency, category. Can be
 * filtered by dates interval
 */
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
      select('category', 'name').as('category');
      select('category', 'color').as('categoryColor');
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
      join('categories', 'categoryId').as('category');
    },
  }))(queries);
}

export type UserExpenseByDateQueryResult = {
  totalExpense: number;
  code: string;
  walletId: string;
  date: number;
};

/**
 * Query expense grouped by dates (same day, month or year) and currency. Can be
 * filtered by dates interval
 */
export function setUserExpenseByDateQuery(
  queries: Queries<StoreSchema>,
  userId: string,
  dateGroup: 'day' | 'month' | 'year' = 'day',
  filterBy?: { startDate?: number; endDate?: number },
  ...keys: QueryKeys
) {
  return createQuerySetter<StoreSchema, 'transactions'>('transactions', () => ({
    queryKeys: [setUserExpenseQuery.name, userId, filterBy, ...keys],
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
      where('type', TRANSACTION_TYPES.EXPENSE);
      if (filterBy?.startDate) {
        where((getCell) => getCell('createdAt')! >= filterBy.startDate!);
      }
      if (filterBy?.endDate) {
        where((getCell) => getCell('createdAt')! <= filterBy.endDate!);
      }
      group('amount', 'sum').as(
        'totalExpense' satisfies keyof UserExpenseByDateQueryResult
      );
      join('wallets', 'walletId');
      join('currencies', 'wallets', 'currencyId').as('currency');
    },
  }))(queries);
}
