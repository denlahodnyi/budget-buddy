import { validate } from 'superstruct';
import { createIndexes } from 'tinybase/with-schemas';

import {
  CreatedCurrencyScheme,
  type CreatedCurrency,
  type CreatedCurrencyErrors,
} from '~/entities/currency';
import { store } from '~/store';

export function createCurrency(c: CreatedCurrency) {
  const [err, obj] = validate(c, CreatedCurrencyScheme, {
    coerce: true,
  });
  if (err) {
    const errors: CreatedCurrencyErrors = {};
    for (const failure of err.failures()) {
      errors[failure.key as keyof CreatedCurrencyErrors] = failure.message;
    }
    return { success: false, errors } as const;
  }

  const indexes = createIndexes(store);
  indexes.setIndexDefinition('sameCurrencies', 'currencies', (getCell) => {
    const userId = getCell('userId');
    const code = getCell('code');
    return userId ? `${userId}_${code}` : code!;
  });
  const existedCustomCurrenciesIds = indexes.getSliceRowIds(
    'sameCurrencies',
    `${obj.userId}_${obj.code}`
  );
  const existedPredefinedCurrenciesIds = indexes.getSliceRowIds(
    'sameCurrencies',
    obj.code
  );
  indexes.delIndexDefinition('sameCurrencies');

  if (
    existedPredefinedCurrenciesIds.length > 0 ||
    existedCustomCurrenciesIds.length > 0
  ) {
    return { success: false, errors: { code: 'Must be unique' } } as const;
  }

  const currencyId = store.addRow('currencies', obj);
  return { success: true, currencyId } as const;
}
