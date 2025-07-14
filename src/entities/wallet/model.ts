import {
  nonempty,
  object,
  size,
  string,
  trimmed,
  type Describe,
  type Infer,
} from 'superstruct';
import type { Row } from 'tinybase/with-schemas';
import {
  computed,
  shallowRef,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue';

import {
  useResultRow,
  useResultRowIds,
  useRow,
  useValue,
  type SchemaFromQueries,
} from '~/shared/lib/tiny-base';
import {
  queries,
  setTotalBalanceByWalletQuery,
  setTotalExpenseByWalletQuery,
  setTotalIncomeByWalletQuery,
  setUserBalanceQuery,
  setUserExpenseQuery,
  setUserIncomeQuery,
  setUserWalletsQuery,
  store,
  type storeTablesSchema,
  type TotalBalanceByWalletQueryResult,
  type TotalExpenseByWalletQueryResult,
  type TotalIncomeByWalletQueryResult,
  type UserBalanceQueryResult,
  type UserExpenseQueryResult,
  type UserIncomeQueryResult,
} from '~/store';
import { formatCurrency } from './lib';

type StoredWallet = Row<typeof storeTablesSchema, 'wallets'>;

export interface BaseWallet extends StoredWallet {
  userId: string;
}

export interface Wallet extends BaseWallet {
  totalBalance: number;
  formattedTotalBalance: string;
}

export const WALLET_NAME_MAX_LENGTH = 50;

export const CreatedWalletScheme: Describe<Omit<BaseWallet, 'currency'>> =
  object({
    name: nonempty(size(trimmed(string()), 0, WALLET_NAME_MAX_LENGTH)),
    createdAt: nonempty(trimmed(string())),
    userId: nonempty(trimmed(string())),
  });

export type CreatedWallet = Infer<typeof CreatedWalletScheme>;

// TODO: refactor this errors type for all models
export type CreatedWalletErrors = {
  [Key in keyof CreatedWallet]?: string;
};

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
      ...(wallet.value as BaseWallet),
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

export function useUserBalance(userId: MaybeRefOrGetter<string>) {
  const settledQuery = shallowRef(
    setUserBalanceQuery(queries, toValue(userId))
  );
  watch(
    () => toValue(userId),
    (newUserId) => {
      settledQuery.value = setUserBalanceQuery(queries, newUserId);
    }
  );
  const result = useResultRow<
    UserBalanceQueryResult,
    SchemaFromQueries<typeof queries>
  >({ queries, queryId: () => settledQuery.value.queryId, rowId: () => '0' });

  return computed(() => ({
    balance: result.value.totalBalance ?? 0,
    formattedBalance: formatCurrency(result.value.totalBalance ?? 0),
  }));
}

export function useUserIncome(userId: MaybeRefOrGetter<string>) {
  const { queryId } = setUserIncomeQuery(queries, toValue(userId));
  const result = useResultRow<
    UserIncomeQueryResult,
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

export function useUserExpense(userId: MaybeRefOrGetter<string>) {
  const { queryId } = setUserExpenseQuery(queries, toValue(userId));
  const result = useResultRow<
    UserExpenseQueryResult,
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

export function useUserWalletsIds(userId: MaybeRefOrGetter<string>) {
  const { queryId, queries: q } = setUserWalletsQuery(queries, toValue(userId));
  return useResultRowIds({ queryId: () => queryId, queries: q });
}

export function useUserBaseWallets(userId: MaybeRefOrGetter<string>) {
  const ids = useUserWalletsIds(userId);
  return computed(() => {
    const baseWallets: (BaseWallet & { id: string })[] = [];

    ids.value.forEach((id) => {
      const wallet = store.getRow('wallets', id) as BaseWallet;
      baseWallets.push({ ...wallet, id });
    });

    return baseWallets;
  });
}

export function useWallet(walletId: MaybeRefOrGetter<string>) {
  const { queryId } = setTotalBalanceByWalletQuery(queries, toValue(walletId));
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
      ...(wallet.value as BaseWallet),
      totalBalance: totalBalanceQueryResult.value?.totalBalance || 0,
      formattedTotalBalance: formatCurrency(
        totalBalanceQueryResult.value?.totalBalance || 0
      ),
    };
  });
}
