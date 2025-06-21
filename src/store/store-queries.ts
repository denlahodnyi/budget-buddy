import type { Queries } from 'tinybase/with-schemas';

import type { QueryResult } from './util-types';
import type { storeTablesSchema, storeValuesSchema } from './store-config';

type QueriesWithSchemas = Queries<
  [typeof storeTablesSchema, typeof storeValuesSchema]
>;

export function setWalletTransactionsQuery(
  queries: QueriesWithSchemas,
  walletId: string
) {
  const queryId = ['walletTransactions', walletId].join('_');
  const queriesReference = queries.setQueryDefinition(
    queryId,
    'transactions',
    ({ select, where, join }) => {
      select('type');
      select('amount');
      select('userId');
      select('walletId');
      select('createdAt');
      where('walletId', walletId);
      join('wallets', 'walletId').as('wallet');
    }
  );

  return { queries: queriesReference, queryId };
}

const totalBalanceByWalletQueryFields = {
  totalBalanceField: 'totalBalance',
} as const;

export type TotalBalanceByWalletQueryResult = QueryResult<
  typeof totalBalanceByWalletQueryFields,
  { totalBalanceField: number | undefined }
>;

export function setTotalBalanceByWalletQuery(
  queries: QueriesWithSchemas,
  walletId: string
) {
  const queryId = ['totalBalance', walletId].join('_');
  const queriesReference = queries.setQueryDefinition(
    queryId,
    'transactions',
    ({ select, where, group }) => {
      select((getCell) => {
        return getCell('type') === 'income'
          ? getCell('amount')
          : -getCell('amount')!;
      }).as('amountWithSign');
      where('walletId', walletId);
      group('amountWithSign', 'sum').as(
        totalBalanceByWalletQueryFields.totalBalanceField
      );
    }
  );

  return { queries: queriesReference, queryId };
}

const totalIncomeByWalletQueryFields = {
  totalIncomeField: 'totalIncome',
} as const;

export type TotalIncomeByWalletQueryResult = QueryResult<
  typeof totalIncomeByWalletQueryFields,
  { totalIncomeField: number | undefined }
>;

export function setTotalIncomeByWalletQuery(
  queries: QueriesWithSchemas,
  walletId: string
) {
  const queryId = ['totalIncome', walletId].join('_');
  const queriesReference = queries.setQueryDefinition(
    queryId,
    'transactions',
    ({ select, where, group }) => {
      select('amount');
      where('walletId', walletId);
      where('type', 'income');
      group('amount', 'sum').as(
        totalIncomeByWalletQueryFields.totalIncomeField
      );
    }
  );

  return { queries: queriesReference, queryId };
}
const totalExpenseByWalletQueryFields = {
  totalExpenseField: 'totalExpense',
} as const;

export type TotalExpenseByWalletQueryResult = QueryResult<
  typeof totalExpenseByWalletQueryFields,
  { totalExpenseField: number | undefined }
>;

export function setTotalExpenseByWalletQuery(
  queries: QueriesWithSchemas,
  walletId: string
) {
  const queryId = ['totalExpense', walletId].join('_');
  const queriesReference = queries.setQueryDefinition(
    queryId,
    'transactions',
    ({ select, where, group }) => {
      select('amount');
      where('walletId', walletId);
      where('type', 'expense');
      group('amount', 'sum').as(
        totalExpenseByWalletQueryFields.totalExpenseField
      );
    }
  );

  return { queries: queriesReference, queryId };
}
