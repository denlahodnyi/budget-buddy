import { createRelationships } from 'tinybase/with-schemas';

import { store } from '~/store';

export function clearUserData(
  userId: string,
  dataToClear: {
    transactions: boolean;
    wallets: boolean;
    categories: boolean;
    currencies: boolean;
    rates: boolean;
  }
) {
  const rel = createRelationships(store);
  let walletsIds: string[] | null;
  let transactionIds: string[] | null;
  let catIds: string[] | null;
  let curIds: string[] | null;

  if (dataToClear.wallets) {
    const walletsRel = 'delUser_linkedWallets';
    rel.setRelationshipDefinition(walletsRel, 'wallets', 'users', 'userId');
    walletsIds = rel.getLocalRowIds(walletsRel, userId);
    rel.delRelationshipDefinition(walletsRel);
  }
  if (dataToClear.transactions) {
    const transRel = 'delUser_linkedTransactions';
    rel.setRelationshipDefinition(transRel, 'transactions', 'users', 'userId');
    transactionIds = rel.getLocalRowIds(transRel, userId);
    rel.delRelationshipDefinition(transRel);
  }
  if (dataToClear.categories) {
    const catRel = 'delUser_linkedCategories';
    rel.setRelationshipDefinition(catRel, 'categories', 'users', 'userId');
    catIds = rel.getLocalRowIds(catRel, userId);
    rel.delRelationshipDefinition(catRel);
  }
  if (dataToClear.currencies) {
    const curRel = 'delUser_linkedCurrencies';
    rel.setRelationshipDefinition(curRel, 'currencies', 'users', 'userId');
    curIds = rel.getLocalRowIds(curRel, userId);
    rel.delRelationshipDefinition(curRel);
  }

  store.transaction(() => {
    if (transactionIds) {
      transactionIds.forEach((trId) => {
        store.delRow('transactions', trId);
      });
    }
    if (walletsIds) {
      walletsIds.forEach((wId) => {
        store.delRow('wallets', wId);
      });
    }
    if (catIds) {
      catIds.forEach((catId) => {
        store.delRow('categories', catId);
      });
    }
    if (curIds) {
      curIds.forEach((curId) => {
        const { userId, code } = store.getRow('currencies', curId);
        if (code && store.hasRow('userExchangeRates', `${userId}_${code}`)) {
          store.delRow('userExchangeRates', `${userId}_${code}`);
        }
        store.delRow('currencies', curId);
      });
    }
    if (dataToClear.rates) {
      store.getRowIds('userExchangeRates').forEach((rowId) => {
        if (rowId.split('_')[0] === userId) {
          store.delRow('userExchangeRates', rowId);
        }
      });
    }
  });
}
