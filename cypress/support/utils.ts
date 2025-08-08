export const currencyOptions = {
  uah: '(UAH) Hryvnia',
  eur: '(EUR) Euro',
};

export const categoryOptions = {
  income: {
    salary: 'Salary',
    gift: 'Gift',
  },
  expense: {
    travel: 'Travel',
  },
};

export const localizeNum = (
  num: number,
  options?: Intl.NumberFormatOptions & {
    symbol?: string;
  }
) => {
  const { symbol, ...rest } = options ?? {};
  const str = num.toLocaleString('default', {
    style: 'currency',
    currency: 'USD',
    ...rest,
  });
  return symbol ? str.replace('$', symbol) : str;
};

const formatDatePart = (v: number) =>
  v.toLocaleString('default', {
    minimumIntegerDigits: 2,
  });

export const inputTransactionDate = (
  day: number = 1,
  month: number = 1,
  year: number = 2025,
  hours: number = 15,
  minutes: number = 0
) =>
  `${formatDatePart(month)}/${formatDatePart(day)}/${year} ${formatDatePart(
    hours
  )}:${formatDatePart(minutes)}`;
