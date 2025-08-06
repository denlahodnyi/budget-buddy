import { queryOptions, useQuery } from '@tanstack/vue-query';

import { DEFAULT_CURRENCIES } from '~/store';

const EXCHANGERATE_ACCESS_KEY = import.meta.env.VITE_EXCHANGERATE_ACCESS_KEY;
const cacheHeadersStorageKey = 'exchangerate_cache_meta';

interface CacheHeaders {
  etag: string;
  date: string;
}
type ExchangeRateHostLiveResponse =
  | {
      success: true;
      privacy: string;
      source: string;
      terms: string;
      timestamp: number;
      quotes: Record<string, number>;
    }
  | {
      success: false;
      error: {
        code: number;
        info: string;
      };
    };

const fetchExchangeRates = async () => {
  const storedCacheHeaders = window.localStorage.getItem(
    cacheHeadersStorageKey
  );
  const cacheHeaders: CacheHeaders | null = storedCacheHeaders
    ? JSON.parse(storedCacheHeaders)
    : null;
  const headers = new Headers();
  if (cacheHeaders?.etag && cacheHeaders.date) {
    headers.append('If-None-Match', cacheHeaders.etag);
    headers.append('If-Modified-Since', cacheHeaders.date);
  }
  const codes = DEFAULT_CURRENCIES.map((c) => c.code);
  const res = await fetch(
    `https://api.exchangerate.host/live?access_key=${EXCHANGERATE_ACCESS_KEY}&currencies=${codes}`,
    {
      method: 'GET',
      headers,
    }
  );

  if (!res.ok) {
    throw new Error('Failed fetching exchange rates');
  }

  const result = (await res.json()) as ExchangeRateHostLiveResponse;
  const newCacheHeaders: CacheHeaders = {
    etag: res.headers.get('ETag') ?? '',
    date: res.headers.get('Date') ?? '',
  };
  window.localStorage.setItem(
    cacheHeadersStorageKey,
    JSON.stringify(newCacheHeaders)
  );

  if (!result.success) {
    return Promise.reject(
      new Error(result.error.info, { cause: result.error })
    );
  }

  return result.quotes;
};

export const exchangeRateQuery = queryOptions({
  queryKey: ['exchangeRates'],
  queryFn: fetchExchangeRates,
  staleTime: 1000 * 60 * 60 * 24, // 24 hours
});

export function useExchangeRates() {
  return useQuery({
    ...exchangeRateQuery,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    networkMode: 'offlineFirst',
  });
}
