import { createRelationships } from 'tinybase/with-schemas';

import { store } from '~/store';

const findWalletsByCurrencyId = (currencyId: string) => {
  const relationships = createRelationships(store);
  const relId = 'deleteCurrency_walletsByCurrency';
  relationships.setRelationshipDefinition(
    relId,
    'wallets',
    'currencies',
    'currencyId'
  );
  const ids = relationships.getLocalRowIds(relId, currencyId);
  relationships.delRelationshipDefinition(relId);
  return ids;
};

const delCurrencyWithUserRates = (currencyId: string) => {
  const { userId, code } = store.getRow('currencies', currencyId);
  if (
    userId &&
    code &&
    store.hasRow('userExchangeRates', `${userId}_${code}`)
  ) {
    store.delRow('userExchangeRates', `${userId}_${code}`);
  }
  store.delRow('currencies', currencyId);
};

export function* deleteCurrency(currencyId: string) {
  const walletIds = findWalletsByCurrencyId(currencyId);

  if (walletIds.length) {
    const newCurrencyId: string = yield {
      isNewCurrencyRequired: true,
      walletsCount: walletIds.length,
      success: false,
    } as const;

    if (!newCurrencyId) {
      throw new Error("Cannot reassign currency id: new id wasn't selected");
    }

    store.transaction(() => {
      walletIds.forEach((id) => {
        store.setPartialRow('wallets', id, { currencyId: newCurrencyId });
      });
      delCurrencyWithUserRates(currencyId);
    });
  } else {
    delCurrencyWithUserRates(currencyId);
  }

  return { success: true } as const;
}
