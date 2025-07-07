import type { Row } from 'tinybase/with-schemas';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import {
  object,
  type Describe,
  enums,
  string,
  nonempty,
  size,
  optional,
  type Infer,
  trimmed,
} from 'superstruct';

import { useResultRowIds, useRow } from '~/shared/lib/tiny-base';
import {
  setWalletTransactionsQuery,
  store,
  type storeTablesSchema,
  queries,
} from '~/store';
import { coerceToNumber, positive } from '~/shared/lib/superstruct';
import { formatCurrency } from '../wallet/lib';
import type { Category } from '../category';

export const DESCRIPTION_MAX_LENGTH = 200;

type StoredTransaction = Row<typeof storeTablesSchema, 'transactions'>;

export interface Transaction extends StoredTransaction {
  type: 'income' | 'expense';
  categoryId: string;
  category: Category;
  formattedAmount: string;
}

export const CreatedTransactionScheme: Describe<
  Omit<Transaction, 'formattedAmount' | 'category'> & {
    userId: NonNullable<Transaction['userId']>;
    walletId: NonNullable<Transaction['walletId']>;
    categoryId: NonNullable<Transaction['categoryId']>;
  }
> = object({
  type: enums(['income', 'expense']),
  amount: positive(coerceToNumber()),
  createdAt: nonempty(trimmed(string())),
  userId: nonempty(trimmed(string())),
  walletId: nonempty(trimmed(string())),
  categoryId: nonempty(trimmed(string())),
  description: optional(size(string(), 0, DESCRIPTION_MAX_LENGTH)),
});

export type CreatedTransaction = Infer<typeof CreatedTransactionScheme>;

export type CreatedTransactionErrors = {
  [Key in keyof CreatedTransaction]?: string;
};

export function useTransactions(walletId: MaybeRefOrGetter<string>) {
  const { queryId, queries: q } = setWalletTransactionsQuery(
    queries,
    toValue(walletId)
  );
  return useResultRowIds({ queryId: () => queryId, queries: q });
}

export function useTransaction(transactionId: MaybeRefOrGetter<string>) {
  const t = useRow({
    store,
    tableId: () => 'transactions',
    rowId: transactionId,
  });
  const category = useRow({
    store,
    tableId: () => 'categories',
    rowId: () => (t.value as Transaction).categoryId,
  });
  return computed<Transaction>(() => {
    return {
      ...t.value,
      type: t.value.type as Transaction['type'],
      categoryId: t.value.categoryId as Transaction['categoryId'],
      category: category.value as Category,
      formattedAmount: formatCurrency(
        (t.value.type as Transaction['type']) === 'income'
          ? t.value.amount
          : -t.value.amount
      ),
    };
  });
}
