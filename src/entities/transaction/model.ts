import {
  enums,
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
import { computed, toValue, type MaybeRefOrGetter } from 'vue';

import { formatCurrency } from '~/shared/lib/money';
import { coerceToNumber, positive } from '~/shared/lib/superstruct';
import { useResultRowIds, useRow } from '~/shared/lib/tiny-base';
import {
  CURRENCY_TYPES,
  queries,
  setUserTransactionsQuery,
  store,
  TRANSACTION_TYPES,
  type storeTablesSchema,
  type TransactionType,
} from '~/store';
import type { Category } from '../category';
import type { BaseCurrency } from '../currency';
import type { BaseWallet } from '../wallet';

export const DESCRIPTION_MAX_LENGTH = 200;

type StoredTransaction = Row<typeof storeTablesSchema, 'transactions'>;

export interface BaseTransaction extends StoredTransaction {
  type: TransactionType;
  categoryId: string;
  userId: string;
  walletId: string;
}

export interface Transaction extends BaseTransaction {
  category: Category;
  wallet: BaseWallet;
  formattedAmount: string;
}

export const CreatedTransactionScheme: Describe<BaseTransaction> = object({
  type: enums([TRANSACTION_TYPES.INCOME, TRANSACTION_TYPES.EXPENSE]),
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

export function useTransactions(userId: MaybeRefOrGetter<string>) {
  const { queryId, queries: q } = setUserTransactionsQuery(
    queries,
    toValue(userId)
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
  const wallet = useRow({
    store,
    tableId: () => 'wallets',
    rowId: () => (t.value as Transaction).walletId,
  });
  return computed<Transaction>(() => {
    const currency = store.getRow(
      'currencies',
      wallet.value.currencyId
    ) as BaseCurrency;
    const isCrypto =
      currency.type === CURRENCY_TYPES.CRYPTO ||
      currency.type === CURRENCY_TYPES.CUSTOM;

    return {
      ...(t.value as BaseTransaction),
      category: category.value as Transaction['category'],
      wallet: wallet.value as Transaction['wallet'],
      formattedAmount: formatCurrency(
        (t.value.type as Transaction['type']) === 'income'
          ? t.value.amount
          : -t.value.amount,
        {
          currency: currency.code,
          symbol: currency.symbol,
          ...(isCrypto
            ? {
                minDecimals: 0,
                maxDecimals: currency.decimalPlaces,
              }
            : {}),
        }
      ),
    };
  });
}
