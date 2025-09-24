import { isEmpty } from 'lodash-es';
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

import {
  getCurrentMonthInterval,
  getLastNMonthsInterval,
  getPrevMonthInterval,
} from '~/shared/lib/dates';
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
  setUserExpenseByDateQuery,
  setUserExpenseQuery,
  setUserIncomeByDateQuery,
  setUserIncomeQuery,
  setUserWalletsQuery,
  store,
  type StoreSchema,
  type storeTablesSchema,
  type TotalBalanceByWalletQueryResult,
  type TotalExpenseByWalletQueryResult,
  type TotalIncomeByWalletQueryResult,
  type UserBalanceQueryResult,
  type UserExpenseByDateQueryResult,
  type UserExpenseQueryResult,
  type UserIncomeByDateQueryResult,
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

export function useUserIncomeTrend(userId: MaybeRefOrGetter<string>) {
  const [prevMonthStart, prevMonthEnd] = getPrevMonthInterval();
  const [currentMonthStart, currentMonthEnd] = getCurrentMonthInterval();

  const prevMonthRange = [prevMonthStart.getTime(), prevMonthEnd.getTime()];
  const currentMonthRange = [
    currentMonthStart.getTime(),
    currentMonthEnd.getTime(),
  ];

  const prevMonthIncomeQuery = shallowRef(
    setUserIncomeQuery(queries, toValue(userId), {
      startDate: prevMonthRange[0],
      endDate: prevMonthRange[1],
    })
  );
  const currentMonthIncomeQuery = shallowRef(
    setUserIncomeQuery(queries, toValue(userId), {
      startDate: currentMonthRange[0],
      endDate: currentMonthRange[1],
    })
  );

  watch(
    () => toValue(userId),
    (newUserId) => {
      prevMonthIncomeQuery.value = setUserIncomeQuery(queries, newUserId, {
        startDate: prevMonthRange[0],
        endDate: prevMonthRange[1],
      });
      currentMonthIncomeQuery.value = setUserIncomeQuery(queries, newUserId, {
        startDate: currentMonthRange[0],
        endDate: currentMonthRange[1],
      });
    }
  );

  const prevMonthIncomeResult = useResultTable<
    Record<string, UserIncomeQueryResult>,
    StoreSchema
  >({
    queries,
    queryId: () => prevMonthIncomeQuery.value.queryId,
  });
  const currentMonthIncomeResult = useResultTable<
    Record<string, UserIncomeQueryResult>,
    StoreSchema
  >({
    queries,
    queryId: () => currentMonthIncomeQuery.value.queryId,
  });
  const { data: liveRates } = useExchangeRates();

  return computed(() => {
    const totalPrevMonthIncome = Object.entries(
      prevMonthIncomeResult.value
    ).reduce((sum, [_, { code, totalIncome }]) => {
      return (
        sum +
        totalIncome / getCurrencyRate(toValue(userId), code, liveRates.value)
      );
    }, 0);
    const totalCurrentMonthIncome = Object.entries(
      currentMonthIncomeResult.value
    ).reduce((sum, [_, { code, totalIncome }]) => {
      return (
        sum +
        totalIncome / getCurrencyRate(toValue(userId), code, liveRates.value)
      );
    }, 0);
    const change =
      totalPrevMonthIncome === 0
        ? 100
        : ((totalCurrentMonthIncome - totalPrevMonthIncome) /
            Math.abs(totalPrevMonthIncome)) *
          100;

    return {
      prevMonthIncome: totalPrevMonthIncome,
      currentMonthIncome: totalCurrentMonthIncome,
      change,
      formattedChange: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
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

export function useUserExpenseTrend(userId: MaybeRefOrGetter<string>) {
  const [prevMonthStart, prevMonthEnd] = getPrevMonthInterval();
  const [currentMonthStart, currentMonthEnd] = getCurrentMonthInterval();

  const prevMonthRange = [prevMonthStart.getTime(), prevMonthEnd.getTime()];
  const currentMonthRange = [
    currentMonthStart.getTime(),
    currentMonthEnd.getTime(),
  ];

  const prevMonthExpenseQuery = shallowRef(
    setUserExpenseQuery(queries, toValue(userId), {
      startDate: prevMonthRange[0],
      endDate: prevMonthRange[1],
    })
  );
  const currentMonthExpenseQuery = shallowRef(
    setUserExpenseQuery(queries, toValue(userId), {
      startDate: currentMonthRange[0],
      endDate: currentMonthRange[1],
    })
  );

  watch(
    () => toValue(userId),
    (newUserId) => {
      prevMonthExpenseQuery.value = setUserExpenseQuery(queries, newUserId, {
        startDate: prevMonthRange[0],
        endDate: prevMonthRange[1],
      });
      currentMonthExpenseQuery.value = setUserExpenseQuery(queries, newUserId, {
        startDate: currentMonthRange[0],
        endDate: currentMonthRange[1],
      });
    }
  );

  const prevMonthExpenseResult = useResultTable<
    Record<string, UserExpenseQueryResult>,
    StoreSchema
  >({
    queries,
    queryId: () => prevMonthExpenseQuery.value.queryId,
  });
  const currentMonthIncomeResult = useResultTable<
    Record<string, UserExpenseQueryResult>,
    StoreSchema
  >({
    queries,
    queryId: () => currentMonthExpenseQuery.value.queryId,
  });
  const { data: liveRates } = useExchangeRates();

  return computed(() => {
    const totalPrevMonthExpense = Object.entries(
      prevMonthExpenseResult.value
    ).reduce((sum, [_, { code, totalExpense }]) => {
      return (
        sum +
        totalExpense / getCurrencyRate(toValue(userId), code, liveRates.value)
      );
    }, 0);
    const totalCurrentMonthExpense = Object.entries(
      currentMonthIncomeResult.value
    ).reduce((sum, [_, { code, totalExpense }]) => {
      return (
        sum +
        totalExpense / getCurrencyRate(toValue(userId), code, liveRates.value)
      );
    }, 0);
    const change =
      totalPrevMonthExpense === 0
        ? 100
        : ((totalCurrentMonthExpense - totalPrevMonthExpense) /
            Math.abs(totalPrevMonthExpense)) *
          100;

    return {
      prevMonthExpense: totalPrevMonthExpense,
      currentMonthExpense: totalCurrentMonthExpense,
      change,
      formattedChange: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
    };
  });
}

export function useUserExpenseByCategories(userId: MaybeRefOrGetter<string>) {
  const [start, end] = getLastNMonthsInterval(3);
  const interval = [start.getTime(), end.getTime()];

  const intervalExpenseQuery = shallowRef(
    setUserExpenseQuery(queries, toValue(userId), {
      startDate: interval[0],
      endDate: interval[1],
    })
  );

  watch(
    () => toValue(userId),
    (newUserId) => {
      intervalExpenseQuery.value = setUserExpenseQuery(queries, newUserId, {
        startDate: interval[0],
        endDate: interval[1],
      });
    }
  );

  const intervalExpenseResult = useResultTable<
    Record<string, UserExpenseQueryResult>,
    StoreSchema
  >({
    queries,
    queryId: () => intervalExpenseQuery.value.queryId,
  });

  const { data: liveRates } = useExchangeRates();

  return computed(() => {
    type ExpenseByCategoryMap = Record<
      string,
      {
        total: number;
        formattedTotal: string;
        category: string;
        colorId: string;
      }
    >;

    if (isEmpty(intervalExpenseResult.value)) {
      return null;
    }

    const expensesByCategory = Object.entries(
      intervalExpenseResult.value
    ).reduce((prev, current) => {
      const [, { category, categoryColor, code, totalExpense }] = current;
      const prevCategory = prev[category] || {
        total: 0,
        category,
        colorId: categoryColor,
      };
      const total = (
        prevCategory.total +
        totalExpense / getCurrencyRate(toValue(userId), code, liveRates.value)
      ).toFixed(2);
      return {
        ...prev,
        [category]: {
          ...prevCategory,
          total: parseFloat(total),
          formattedTotal: formatCurrency(parseFloat(total)),
        },
      };
    }, {} as ExpenseByCategoryMap);

    return Object.values(expensesByCategory);
  });
}

export function useUserTotalIncomeByDates(
  userId: MaybeRefOrGetter<string>,
  filterBy: MaybeRefOrGetter<{ startDate: number; endDate: number }>
) {
  const incomeQuery = shallowRef(
    setUserIncomeByDateQuery(queries, toValue(userId), 'day', {
      startDate: toValue(filterBy).startDate,
      endDate: toValue(filterBy).endDate,
    })
  );

  watch(
    [() => toValue(userId), () => toValue(filterBy)],
    ([newUserId, newFilterBy]) => {
      incomeQuery.value = setUserIncomeByDateQuery(queries, newUserId, 'day', {
        startDate: newFilterBy.startDate,
        endDate: newFilterBy.endDate,
      });
    }
  );

  const incomeByDatesResult = useResultTable<
    Record<string, UserIncomeByDateQueryResult>,
    StoreSchema
  >({
    queries,
    queryId: () => incomeQuery.value.queryId,
  });

  const { data: liveRates } = useExchangeRates();

  return computed(() => {
    type IncomeByDatesMap = Record<
      number,
      {
        total: number;
        formattedTotal: string;
        date: number;
      }
    >;

    if (isEmpty(incomeByDatesResult.value)) {
      return null;
    }

    const expensesByCategory = Object.entries(incomeByDatesResult.value).reduce(
      (prev, current) => {
        const [, { code, date, totalIncome }] = current;
        const prevCategory = prev[date] || {
          total: 0,
          date,
        };
        const total = (
          prevCategory.total +
          totalIncome / getCurrencyRate(toValue(userId), code, liveRates.value)
        ).toFixed(2);
        return {
          ...prev,
          [date]: {
            ...prevCategory,
            total: parseFloat(total),
            formattedTotal: formatCurrency(parseFloat(total)),
          },
        };
      },
      {} as IncomeByDatesMap
    );

    return Object.values(expensesByCategory).sort((d1, d2) =>
      d1.date > d2.date ? 1 : -1
    );
  });
}

export function useUserTotalExpenseByDates(
  userId: MaybeRefOrGetter<string>,
  filterBy: MaybeRefOrGetter<{ startDate: number; endDate: number }>
) {
  const incomeQuery = shallowRef(
    setUserExpenseByDateQuery(queries, toValue(userId), 'day', {
      startDate: toValue(filterBy).startDate,
      endDate: toValue(filterBy).endDate,
    })
  );

  watch(
    [() => toValue(userId), () => toValue(filterBy)],
    ([newUserId, newFilterBy]) => {
      incomeQuery.value = setUserExpenseByDateQuery(queries, newUserId, 'day', {
        startDate: newFilterBy.startDate,
        endDate: newFilterBy.endDate,
      });
    }
  );

  const expenseByDatesResult = useResultTable<
    Record<string, UserExpenseByDateQueryResult>,
    StoreSchema
  >({
    queries,
    queryId: () => incomeQuery.value.queryId,
  });

  const { data: liveRates } = useExchangeRates();

  return computed(() => {
    type ExpenseByDatesMap = Record<
      number,
      {
        total: number;
        formattedTotal: string;
        date: number;
      }
    >;

    if (isEmpty(expenseByDatesResult.value)) {
      return null;
    }

    const expensesByCategory = Object.entries(
      expenseByDatesResult.value
    ).reduce((prev, current) => {
      const [, { code, date, totalExpense }] = current;
      const prevCategory = prev[date] || {
        total: 0,
        date,
      };
      const total = (
        prevCategory.total +
        totalExpense / getCurrencyRate(toValue(userId), code, liveRates.value)
      ).toFixed(2);
      return {
        ...prev,
        [date]: {
          ...prevCategory,
          total: parseFloat(total),
          formattedTotal: formatCurrency(-parseFloat(total)),
        },
      };
    }, {} as ExpenseByDatesMap);

    return Object.values(expensesByCategory).sort((d1, d2) =>
      d1.date > d2.date ? 1 : -1
    );
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
    queryId: toRef(() => settledQuery.value.queryId),
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
