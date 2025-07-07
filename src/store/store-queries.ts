import type { Queries, Select } from 'tinybase/with-schemas';

import type { QueryResult } from './util-types';
import { storeTablesSchema, type storeValuesSchema } from './store-config';

type QueriesWithSchemas = Queries<
  [typeof storeTablesSchema, typeof storeValuesSchema]
>;

function selectAll<TTableId extends keyof typeof storeTablesSchema>(
  select: Select<typeof storeTablesSchema, TTableId>,
  tableId: TTableId
) {
  Object.keys(storeTablesSchema[tableId]).forEach((field) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    select(field as any)
  );
}

export function setWalletTransactionsQuery(
  queries: QueriesWithSchemas,
  walletId: string
) {
  const queryId = ['walletTransactions', walletId].join('_');
  const queriesReference = queries.setQueryDefinition(
    queryId,
    'transactions',
    ({ select, where, join }) => {
      selectAll(select, 'transactions');
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

export function setParentOnlyCategoriesQuery(
  queries: QueriesWithSchemas,
  userId: string,
  categoryType?: string // TODO: set better type
) {
  const queryId = ['parentCategories', userId, categoryType].join('_');
  const queryReference = queries.setQueryDefinition(
    queryId,
    'categories',
    ({ select, where }) => {
      selectAll(select, 'categories');
      where(
        (getCell) =>
          getCell('userId') === userId &&
          !getCell('parentId') &&
          (categoryType ? getCell('type') === categoryType : true)
      );
    }
  );

  return { queries: queryReference, queryId };
}

export function setSubCategoriesQuery(
  queries: QueriesWithSchemas,
  parentCategoryId: string
) {
  const queryId = ['subCategories', parentCategoryId].join('_');
  const queryReference = queries.setQueryDefinition(
    queryId,
    'categories',
    ({ select, where }) => {
      selectAll(select, 'categories');
      where('parentId', parentCategoryId);
    }
  );

  return { queries: queryReference, queryId };
}

export function setFullCategoriesQuery(
  queries: QueriesWithSchemas,
  userId: string,
  categoryType?: string, // TODO: set better type
  onlyParents?: boolean
) {
  const queryId = [
    'fullCategories',
    userId,
    categoryType,
    onlyParents ? 'parentsOnly' : '',
  ].join('_');
  const queryReference = queries.setQueryDefinition(
    queryId,
    'categories',
    ({ select, where }) => {
      selectAll(select, 'categories');
      where(
        (getCell) =>
          getCell('userId') === userId &&
          (onlyParents ? !getCell('parentId') : true) &&
          (categoryType ? getCell('type') === categoryType : true)
      );
    }
  );

  return { queries: queryReference, queryId };
}

const transactionsCountPerCatQueryFields = {
  idField: 'id',
  totalField: 'total',
} as const;

export type TransactionsPerCatQueryResult = QueryResult<
  typeof transactionsCountPerCatQueryFields,
  { idField: string | undefined; totalField: number | undefined }
>;

export function setTransactionsCountPerCategoryQuery(
  queries: QueriesWithSchemas,
  categoryIds: string[]
) {
  const queryId = ['transactionsCountPerCat', ...categoryIds].join('_');
  const queryReference = queries.setQueryDefinition(
    queryId,
    'transactions',
    ({ select, group, where }) => {
      select('categoryId').as(transactionsCountPerCatQueryFields.idField);
      select('categoryId');
      group('categoryId', 'count').as(
        transactionsCountPerCatQueryFields.totalField
      );
      where((getCell) => {
        const catId = getCell('categoryId');
        return catId ? categoryIds.includes(catId) : false;
      });
    }
  );

  return { queries: queryReference, queryId };
}
