import {
  boolean,
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
  shallowRef,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type ShallowRef,
} from 'vue';

import { coerceToNumber, coerceToUppercase } from '~/shared/lib/superstruct';
import { useResultTable, useRow } from '~/shared/lib/tiny-base';
import {
  CURRENCY_TYPES,
  queries,
  setUserFullCurrencies,
  store,
  type CurrencyType,
  type StoreSchema,
} from '~/store';

type StoredCurrency = Row<StoreSchema[0], 'currencies'>;

export interface BaseCurrency extends StoredCurrency {
  name: string;
  code: string;
  type: CurrencyType;
  isISO: boolean;
  decimalPlaces: number;
}

type CurrencyWith<T> = BaseCurrency & T;

export type CurrencyWithUserRate = CurrencyWith<{ userRate?: number }>;

export const CreatedCurrencyScheme: Describe<BaseCurrency> = object({
  type: enums([
    CURRENCY_TYPES.FIAT,
    CURRENCY_TYPES.CRYPTO,
    CURRENCY_TYPES.CUSTOM,
  ]),
  name: nonempty(trimmed(size(string(), 3, 20))),
  code: nonempty(trimmed(size(coerceToUppercase(), 3, 10))),
  decimalPlaces: size(coerceToNumber(integer()), 0, 10),
  userId: optional(trimmed(string())),
  isISO: boolean(),
});

export type CreatedCurrency = Infer<typeof CreatedCurrencyScheme>;

export type CreatedCurrencyErrors = {
  [Key in keyof CreatedCurrency]?: string;
};

export function useUserCurrencies(userId: MaybeRefOrGetter<string>) {
  const settledQuery = shallowRef(
    setUserFullCurrencies(queries, toValue(userId))
  );

  watch(
    () => toValue(userId),
    (newUserId) => {
      settledQuery.value = setUserFullCurrencies(queries, newUserId);
    }
  );

  return useResultTable<
    Record<string, (CurrencyWithUserRate & { [k: string]: never }) | undefined>,
    StoreSchema
  >({
    queries,
    queryId: () => settledQuery.value.queryId,
  });
}

export function useCurrency(currencyId: MaybeRefOrGetter<string>) {
  return useRow({
    store,
    tableId: 'currencies',
    rowId: currencyId,
  }) as unknown as ShallowRef<BaseCurrency>;
}
