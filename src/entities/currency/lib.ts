import { formatCurrency } from '~/shared/lib/money';
import { CURRENCY_TYPES } from '~/store';
import type { BaseCurrency } from './model';

export function formatAmountByCurrency(amount: number, currency: BaseCurrency) {
  const isCrypto =
    currency.type === CURRENCY_TYPES.CRYPTO ||
    currency.type === CURRENCY_TYPES.CUSTOM;

  return formatCurrency(amount, {
    currency: currency.code,
    symbol: currency.symbol,
    ...(isCrypto
      ? {
          minDecimals: 0,
          maxDecimals: currency.decimalPlaces,
        }
      : {}),
  });
}
