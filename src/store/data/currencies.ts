import { code as ccCode } from 'currency-codes';
import getCurrencySymbol from 'currency-symbol-map';

interface CurrencyScheme {
  name: string;
  code: string;
  type: 'fiat' | 'crypto';
  isISO: boolean;
  decimalPlaces: number;
  symbol?: string;
}

export const FIAT_CODES = [
  { code: 'USD' },
  { code: 'EUR' },
  { code: 'UAH' },
  { code: 'GBP' },
  { code: 'CHF' },
  { code: 'AUD' },
  { code: 'CAD' },
  { code: 'JPY' },
  { code: 'PLN' },
  { code: 'TRY' },
  { code: 'SEK' },
  { code: 'INR' },
];
export const CRYPTO_CODES = [{ code: 'BTC', name: 'Bitcoin', decimals: 8 }];

export const DEFAULT_CURRENCIES: CurrencyScheme[] = FIAT_CODES.map(
  ({ code }) => {
    const details = ccCode(code);
    if (details) {
      return {
        name: details.currency,
        code: details.code,
        type: 'fiat' as CurrencyScheme['type'],
        isISO: true,
        decimalPlaces: details.digits,
      };
    }
  }
)
  .concat(
    CRYPTO_CODES.map(({ code, decimals, name }) => ({
      name,
      code,
      type: 'crypto' as CurrencyScheme['type'],
      isISO: false,
      decimalPlaces: decimals,
    }))
  )
  .filter((o) => !!o)
  .map((o) => ({ ...o, symbol: getCurrencySymbol(o.code) }));
