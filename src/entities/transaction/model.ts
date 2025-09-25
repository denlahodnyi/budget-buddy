import {
  enums,
  integer,
  nonempty,
  object,
  optional,
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
  type MaybeRef,
  type MaybeRefOrGetter,
} from 'vue';

import { coerceToNumber, positive } from '~/shared/lib/superstruct';
import {
  useResultRowCount,
  useResultSortedRowIds,
  useRow,
} from '~/shared/lib/tiny-base';
import {
  queries,
  setUserTransactionsQuery,
  store,
  TRANSACTION_TYPES,
  type storeTablesSchema,
  type TransactionType,
  type UserTransactionsQueryFilters,
  type UserTransactionsQueryResultRow,
} from '~/store';
import type { Category } from '../category';
import { formatAmountByCurrency, type BaseCurrency } from '../currency';
import type { BaseWallet } from '../wallet';

export const DESCRIPTION_MAX_LENGTH = 200;
export const PER_PAGE = 10;

type StoredTransaction = Row<typeof storeTablesSchema, 'transactions'>;

export type TransactionPopulatedWith<
  TBase extends StoredTransaction,
  TPopulated extends { wallet: boolean; category: boolean; currency: boolean }
> = TBase &
  ((TPopulated['category'] extends true
    ? { category: Category | null }
    : object) &
    (TPopulated['wallet'] extends true
      ? { wallet: BaseWallet | null }
      : object) &
    (TPopulated['currency'] extends true
      ? { currency: BaseCurrency | null }
      : object));

export interface BaseTransaction extends StoredTransaction {
  type: TransactionType;
  categoryId: string;
  userId: string;
  walletId: string;
}

export interface Transaction extends BaseTransaction {
  formattedAmount: string;
}

export const CreatedTransactionScheme: Describe<BaseTransaction> = object({
  type: enums([TRANSACTION_TYPES.INCOME, TRANSACTION_TYPES.EXPENSE]),
  amount: positive(coerceToNumber()),
  createdAt: integer(),
  userId: nonempty(trimmed(string())),
  walletId: nonempty(trimmed(string())),
  categoryId: nonempty(trimmed(string())),
  description: optional(size(string(), 0, DESCRIPTION_MAX_LENGTH)),
});

export type CreatedTransaction = Infer<typeof CreatedTransactionScheme>;

export type CreatedTransactionErrors = {
  [Key in keyof CreatedTransaction]?: string;
};

export type TransactionsFilters = UserTransactionsQueryFilters;

export function useUserTransactionsQuery<
  TPopulatedWithWallet extends boolean = false,
  TPopulatedWithCategory extends boolean = false,
  TPopulatedWithCurrency extends boolean = false
>(
  userId: MaybeRefOrGetter<string>,
  filterBy?: MaybeRef<TransactionsFilters>,
  populatedWith?: {
    wallet: TPopulatedWithWallet;
    category: TPopulatedWithCategory;
    currency: TPopulatedWithCurrency;
  }
) {
  const settledQuery = shallowRef(
    setUserTransactionsQuery(queries, toValue(userId), toValue(filterBy), {
      wallet: populatedWith?.wallet ?? false,
      category: populatedWith?.category ?? false,
      currency: populatedWith?.currency ?? false,
    })
  );
  watch(
    [() => toValue(userId), () => toValue(filterBy)],
    ([newUserId, newFilterBy], _, onCleanup) => {
      settledQuery.value = setUserTransactionsQuery(
        queries,
        newUserId,
        newFilterBy,
        {
          wallet: populatedWith?.wallet ?? false,
          category: populatedWith?.category ?? false,
          currency: populatedWith?.currency ?? false,
        }
      );

      onCleanup(() => {
        queries.delQueryDefinition(settledQuery.value.queryId);
      });
    }
  );

  return {
    queryId: toRef(() => settledQuery.value.queryId),
    queries,
    toTypedResultRow: (row: unknown) => row as UserTransactionsQueryResultRow,
    adaptResultRow: (row: UserTransactionsQueryResultRow) => {
      const result = setUserTransactionsQuery.transformResult(row);
      const formattedAmount = result.currency
        ? formatAmountByCurrency(
            (result.type as Transaction['type']) === 'income'
              ? result.amount
              : -result.amount,
            result.currency as BaseCurrency
          )
        : '';

      return { ...result, formattedAmount } as TransactionPopulatedWith<
        Transaction,
        {
          category: TPopulatedWithCategory;
          wallet: TPopulatedWithWallet;
          currency: TPopulatedWithCurrency;
        }
      >;
    },
  };
}

export function useTransactionsIds(
  userId: MaybeRefOrGetter<string>,
  options?: {
    offset?: MaybeRefOrGetter<number>;
  }
) {
  const { queryId, queries } = useUserTransactionsQuery(userId);

  const ids = useResultSortedRowIds({
    queryId,
    queries,
    cellId: 'createdAt',
    descending: true,
    offset: options?.offset ?? 0,
    limit: PER_PAGE,
  });

  return { ids, queryId };
}

export function useTransactionsCount(
  userId: MaybeRefOrGetter<string>,
  filterBy?: MaybeRef<TransactionsFilters>
) {
  const { queryId, queries } = useUserTransactionsQuery(userId, filterBy);

  return useResultRowCount({ queryId, queries });
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
  const wallet = useRow({
    store,
    tableId: () => 'wallets',
    rowId: () => (t.value as Transaction).walletId,
  });

  return computed(() => {
    const transaction = t.value as BaseTransaction;
    const currency = store.getRow(
      'currencies',
      wallet.value.currencyId
    ) as BaseCurrency;

    const result: TransactionPopulatedWith<
      Transaction,
      {
        category: true;
        wallet: true;
        currency: true;
      }
    > = {
      ...transaction,
      category: category.value as Category,
      wallet: wallet.value as BaseWallet,
      currency,
      formattedAmount: formatAmountByCurrency(
        transaction.type === 'income'
          ? transaction.amount
          : -transaction.amount,
        currency
      ),
    };

    return result;
  });
}
