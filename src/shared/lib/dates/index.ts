function setEndOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );
}

export function setStartOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
}

export function getCurrentYearInterval() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const end = setEndOfDay(new Date(now.getFullYear(), 11, 31));
  return [start, end];
}

export function getCurrentMonthInterval() {
  const now = new Date();
  const start = setStartOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
  const end = setEndOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  return [start, end];
}

export function getPrevMonthInterval() {
  const now = new Date();
  const start = setStartOfDay(
    new Date(now.getFullYear(), now.getMonth() - 1, 1),
  );
  const end = setEndOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
  return [start, end];
}

export function getLastNMonthsInterval(n: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - n, 1);
  return [start, setEndOfDay(now)];
}

export function getLastNDaysInterval(n: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - n);
  return [start, setEndOfDay(now)];
}

export function getDatesInterval(
  interval: '3d' | '7d' | '30d' | '90d' | '1m' | '<1m' | '1y',
) {
  switch (interval) {
    case '3d': {
      return getLastNDaysInterval(3);
    }
    case '7d': {
      return getLastNDaysInterval(7);
    }
    case '30d': {
      return getLastNDaysInterval(30);
    }
    case '90d': {
      return getLastNDaysInterval(90);
    }
    case '1m': {
      return getCurrentMonthInterval();
    }
    case '<1m': {
      return getPrevMonthInterval();
    }
    case '1y': {
      return getCurrentYearInterval();
    }
    default: {
      const _exhaustiveCheck: never = interval;
      return _exhaustiveCheck;
    }
  }
}
