import { store } from '~/store';

export function setExchangeRate(
  userId: string,
  currencyCode: string,
  rate?: number
) {
  store.setRow('userExchangeRates', `${userId}_${currencyCode}`, { rate });
}
