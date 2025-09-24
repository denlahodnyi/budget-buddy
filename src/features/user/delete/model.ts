import { createRelationships } from 'tinybase/with-schemas';

import { store } from '~/store';

export function deleteUser(userId: string) {
  const walletsRel = 'delUser_linkedWallets';
  const transRel = 'delUser_linkedTransactions';
  const catRel = 'delUser_linkedCategories';
  const curRel = 'delUser_linkedCurrencies';
  const rel = createRelationships(store);
  rel.setRelationshipDefinition(walletsRel, 'wallets', 'users', 'userId');
  rel.setRelationshipDefinition(transRel, 'transactions', 'users', 'userId');
  rel.setRelationshipDefinition(catRel, 'categories', 'users', 'userId');
  rel.setRelationshipDefinition(curRel, 'currencies', 'users', 'userId');
  const walletsIds = rel.getLocalRowIds(walletsRel, userId);
  const transactionIds = rel.getLocalRowIds(transRel, userId);
  const catIds = rel.getLocalRowIds(catRel, userId);
  const curIds = rel.getLocalRowIds(curRel, userId);
  rel.delRelationshipDefinition(walletsRel);
  rel.delRelationshipDefinition(transRel);
  rel.delRelationshipDefinition(catRel);
  rel.delRelationshipDefinition(curRel);

  store.transaction(() => {
    transactionIds.forEach((trId) => {
      store.delRow('transactions', trId);
    });
    walletsIds.forEach((wId) => {
      store.delRow('wallets', wId);
    });
    catIds.forEach((catId) => {
      store.delRow('categories', catId);
    });
    curIds.forEach((curId) => {
      const { userId, code } = store.getRow('currencies', curId);
      if (code && store.hasRow('userExchangeRates', `${userId}_${code}`)) {
        store.delRow('userExchangeRates', `${userId}_${code}`);
      }
      store.delRow('currencies', curId);
    });
    store.delRow('users', userId);

    if (store.getRowCount('users') === 0) {
      const rowId = store.addRow('users', { name: 'User #1' });
      if (rowId) store.setValue('userId', rowId);
    } else {
      const userIds = store.getRowIds('users');
      store.setValue('userId', userIds[0]);
    }
  });

  return { success: true };
}
