import { validate } from 'superstruct';
import { createIndexes } from 'tinybase/with-schemas';

import {
  CreatedCurrencyScheme,
  type CreatedCurrency,
  type CreatedCurrencyErrors,
} from '~/entities/currency';
import { store } from '~/store';

export function editCurrency(
  currencyId: string,
  partiallyEditedCurrency: Partial<CreatedCurrency>
) {
  const [err, obj] = validate(partiallyEditedCurrency, CreatedCurrencyScheme, {
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
  indexes.setIndexDefinition(
    'sameCurrencies',
    'currencies',
    (getCell) => `${getCell('userId')}_${getCell('code')}`
  );
  const existedCurrenciesIds = indexes.getSliceRowIds(
    'sameCurrencies',
    `${obj.userId}_${obj.code}`
  );
  indexes.delIndexDefinition('sameCurrencies');

  if (existedCurrenciesIds.length > 0) {
    return { success: false, errors: { code: 'Must be unique' } } as const;
  }

  store.setPartialRow('currencies', currencyId, obj);
  return { success: true } as const;
}
