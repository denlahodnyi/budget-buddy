import type { Row } from 'tinybase/with-schemas';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';

import { useResultRowIds, useRow } from '~/shared/lib/tiny-base';
import {
  setWalletTransactionsQuery,
  store,
  type storeTablesSchema,
  queries,
} from '~/store';
import { formatCurrency } from '../wallet/lib';

export interface Transaction
  extends Row<typeof storeTablesSchema, 'transactions'> {
  type: 'income' | 'expense';
  formattedAmount: string;
}

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
  return computed<Transaction>(() => {
    return {
      ...t.value,
      type: t.value.type as Transaction['type'],
      formattedAmount: formatCurrency(
        (t.value.type as Transaction['type']) === 'income'
          ? t.value.amount
          : -t.value.amount
      ),
    };
  });
}
