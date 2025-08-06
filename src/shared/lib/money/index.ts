type FormatOptions = {
  currency?: string; // e.g. USD
  locale?: string;
  minDecimals?: number;
  maxDecimals?: number;
  symbol?: string; // e.g. $
};

const cachedFormatters = new Map();

export function formatCurrency(amount: number, options?: FormatOptions) {
  const {
    currency = 'USD',
    locale = 'en-US',
    minDecimals = 2,
    maxDecimals = 2,
    symbol,
  } = options ?? {};
  const cacheKey = JSON.stringify({
    locale,
    currency,
    minDecimals,
    maxDecimals,
  });
  let formatter: Intl.NumberFormat;

  if (cachedFormatters.has(cacheKey)) {
    formatter = cachedFormatters.get(cacheKey);
  } else {
    formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: maxDecimals,
    });
    cachedFormatters.set(cacheKey, formatter);
  }

  if (symbol) {
    const parts = formatter.formatToParts(amount);
    return parts.reduce((result, part) => {
      switch (part.type) {
        case 'currency':
          return result + symbol;
        default:
          return result + part.value;
      }
    }, '');
  }

  return formatter.format(amount);
}
