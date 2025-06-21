import type { Row } from 'tinybase/with-schemas';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';

import {
  useResultRow,
  useRow,
  useValue,
  type SchemaFromQueries,
} from '~/shared/lib/tiny-base';
import {
  setTotalBalanceByWalletQuery,
  setTotalIncomeByWalletQuery,
  setTotalExpenseByWalletQuery,
  store,
  type storeTablesSchema,
  type TotalBalanceByWalletQueryResult,
  type TotalIncomeByWalletQueryResult,
  type TotalExpenseByWalletQueryResult,
  queries,
} from '~/store';
import { formatCurrency } from './lib';

export interface Wallet extends Row<typeof storeTablesSchema, 'wallets'> {
  totalBalance: number;
  formattedTotalBalance: string;
}

export function useCurrentWalletId() {
  return useValue({ store, valueId: () => 'walletId' });
}

export function useCurrentWallet() {
  const walletId = useCurrentWalletId();

  const { queryId } = setTotalBalanceByWalletQuery(queries, walletId.value);
  const totalBalanceQueryResult = useResultRow<
    TotalBalanceByWalletQueryResult,
    SchemaFromQueries<typeof queries>
  >({
    queries,
    queryId: () => queryId,
    rowId: () => '0',
  });

  const wallet = useRow({
    store,
    tableId: () => 'wallets',
    rowId: walletId,
  });

  return computed<Wallet>(() => {
    return {
      ...wallet.value,
      totalBalance: totalBalanceQueryResult.value?.totalBalance || 0,
      formattedTotalBalance: formatCurrency(
        totalBalanceQueryResult.value?.totalBalance || 0
      ),
    };
  });
}

export function useTotalIncomeByWallet(walletId: MaybeRefOrGetter<string>) {
  const { queryId } = setTotalIncomeByWalletQuery(queries, toValue(walletId));
  const result = useResultRow<
    TotalIncomeByWalletQueryResult,
    SchemaFromQueries<typeof queries>
  >({
    queries,
    queryId: () => queryId,
    rowId: () => '0',
  });
  return computed(() => {
    return {
      ...result.value,
      formattedTotalIncome: formatCurrency(result.value.totalIncome || 0),
    };
  });
}

export function useTotalExpenseByWallet(walletId: MaybeRefOrGetter<string>) {
  const { queryId } = setTotalExpenseByWalletQuery(queries, toValue(walletId));
  const result = useResultRow<
    TotalExpenseByWalletQueryResult,
    SchemaFromQueries<typeof queries>
  >({
    queries,
    queryId: () => queryId,
    rowId: () => '0',
  });
  return computed(() => {
    return {
      ...result.value,
      formattedTotalExpense: formatCurrency(-(result.value.totalExpense || 0)),
    };
  });
}
