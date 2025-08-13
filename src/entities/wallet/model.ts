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
  toRef,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue';

import { formatCurrency } from '~/shared/lib/money';
import {
  useResultRow,
  useResultRowIds,
  useResultTable,
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
  type StoreSchema,
  type storeTablesSchema,
  type TotalBalanceByWalletQueryResult,
  type TotalExpenseByWalletQueryResult,
  type TotalIncomeByWalletQueryResult,
  type UserBalanceQueryResult,
  type UserExpenseQueryResult,
  type UserIncomeQueryResult,
  type UserWalletsQueryResultRow,
} from '~/store';
import {
  formatAmountByCurrency,
  useExchangeRates,
  type BaseCurrency,
} from '../currency';

type StoredWallet = Row<typeof storeTablesSchema, 'wallets'>;

export type WalletPopulatedWith<
  TBase extends StoredWallet,
  TPopulated extends { currency: boolean }
> = TBase &
  (TPopulated['currency'] extends true
    ? { currency: BaseCurrency | null }
    : never);

export interface BaseWallet extends StoredWallet {
  userId: string;
}

export interface Wallet extends BaseWallet {
  totalBalance: number;
  formattedTotalBalance: string;
}

export const WALLET_NAME_MAX_LENGTH = 50;

export const CreatedWalletScheme: Describe<BaseWallet> = object({
  name: nonempty(size(trimmed(string()), 0, WALLET_NAME_MAX_LENGTH)),
  createdAt: nonempty(trimmed(string())),
  userId: nonempty(trimmed(string())),
  currencyId: nonempty(trimmed(string())),
});

export type CreatedWallet = Infer<typeof CreatedWalletScheme>;

// TODO: refactor this errors type for all models
export type CreatedWalletErrors = {
  [Key in keyof CreatedWallet]?: string;
};

function getCurrencyRate(
  userId: string,
  currencyCode: string,
  rates?: Record<string, number>
) {
  const liveRate = rates && rates[`USD${currencyCode}`];
  const userRate = store.getCell(
    'userExchangeRates',
    `${toValue(userId)}_${currencyCode}`,
    'rate'
  );
  return userRate || liveRate || 1;
}

export function useCurrentWalletId() {
  return useValue({ store, valueId: () => 'walletId' });
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
  const result = useResultTable<
    Record<string, UserBalanceQueryResult>,
    StoreSchema
  >({
    queries,
    queryId: () => settledQuery.value.queryId,
  });
  const { data: liveRates } = useExchangeRates();

  return computed(() => {
    const totalBalance = Object.entries(result.value).reduce(
      (sum, [_, { code, totalBalance }]) => {
        return (
          sum +
          totalBalance / getCurrencyRate(toValue(userId), code, liveRates.value)
        );
      },
      0
    );
    return {
      balance: totalBalance ?? 0,
      formattedBalance: formatCurrency(totalBalance ?? 0),
    };
  });
}

export function useUserIncome(userId: MaybeRefOrGetter<string>) {
  const settledQuery = shallowRef(setUserIncomeQuery(queries, toValue(userId)));
  watch(
    () => toValue(userId),
    (newUserId) => {
      settledQuery.value = setUserIncomeQuery(queries, newUserId);
    }
  );
  const result = useResultTable<
    Record<string, UserIncomeQueryResult>,
    StoreSchema
  >({
    queries,
    queryId: () => settledQuery.value.queryId,
  });
  const { data: liveRates } = useExchangeRates();

  return computed(() => {
    const totalIncome = Object.entries(result.value).reduce(
      (sum, [_, { code, totalIncome }]) => {
        return (
          sum +
          totalIncome / getCurrencyRate(toValue(userId), code, liveRates.value)
        );
      },
      0
    );
    return {
      income: totalIncome ?? 0,
      formattedTotalIncome: formatCurrency(totalIncome ?? 0),
    };
  });
}

export function useUserExpense(userId: MaybeRefOrGetter<string>) {
  const settledQuery = shallowRef(
    setUserExpenseQuery(queries, toValue(userId))
  );
  watch(
    () => toValue(userId),
    (newUserId) => {
      settledQuery.value = setUserExpenseQuery(queries, newUserId);
    }
  );
  const result = useResultTable<
    Record<string, UserExpenseQueryResult>,
    StoreSchema
  >({
    queries,
    queryId: () => settledQuery.value.queryId,
  });
  const { data: liveRates } = useExchangeRates();

  return computed(() => {
    const totalExpense = Object.entries(result.value).reduce(
      (sum, [_, { code, totalExpense }]) => {
        return (
          sum +
          totalExpense / getCurrencyRate(toValue(userId), code, liveRates.value)
        );
      },
      0
    );
    return {
      expense: totalExpense ?? 0,
      formattedTotalExpense: formatCurrency(-(totalExpense || 0)),
    };
  });
}

export function useUserWalletsQuery<
  TPopulatedWithCurrency extends boolean = false
>(
  userId: MaybeRefOrGetter<string>,
  populateWith?: { currency: TPopulatedWithCurrency }
) {
  const settledQuery = shallowRef(
    setUserWalletsQuery(queries, toValue(userId), {
      currency: populateWith?.currency ?? false,
    })
  );
  watch(
    () => toValue(userId),
    (newUserId) => {
      settledQuery.value = setUserWalletsQuery(queries, newUserId, {
        currency: true,
      });
    }
  );

  return {
    queryId: toRef(settledQuery.value.queryId),
    queries,
    toTypedResultRow: (row: unknown) => row as UserWalletsQueryResultRow,
    adaptResultRow: (row: UserWalletsQueryResultRow) => {
      const result = setUserWalletsQuery.transformResult(row);
      return result as WalletPopulatedWith<
        BaseWallet,
        { currency: TPopulatedWithCurrency }
      >;
    },
  };
}

export function useUserWalletsIds(userId: MaybeRefOrGetter<string>) {
  const { queryId, queries } = useUserWalletsQuery(userId);
  const ids = useResultRowIds({ queryId, queries });
  return { ids, queryId, queries };
}

export function useUserWallets(userId: MaybeRefOrGetter<string>) {
  const { queries, queryId, toTypedResultRow, adaptResultRow } =
    useUserWalletsQuery(userId, { currency: true });
  const ids = useResultRowIds({ queries, queryId });

  return computed(() => {
    return ids.value.map((id) => {
      const wallet = adaptResultRow(
        toTypedResultRow(queries.getResultRow(queryId.value, id))
      );
      return { id, ...wallet };
    });
  });
}

export function useWallet(walletId: MaybeRefOrGetter<string>) {
  const { queryId } = setTotalBalanceByWalletQuery(queries, toValue(walletId));
  const totalBalanceQueryResult = useResultRow<
    TotalBalanceByWalletQueryResult,
    StoreSchema
  >({
    queries,
    queryId,
    rowId: '0',
  });

  const wallet = useRow({
    store,
    tableId: 'wallets',
    rowId: walletId,
  });

  return computed<Wallet>(() => {
    const { totalBalance } = totalBalanceQueryResult.value;
    const currency = store.getRow(
      'currencies',
      wallet.value.currencyId
    ) as BaseCurrency;

    return {
      ...(wallet.value as BaseWallet),
      totalBalance: totalBalance || 0,
      formattedTotalBalance: formatAmountByCurrency(
        totalBalance ?? 0,
        currency
      ),
    };
  });
}
