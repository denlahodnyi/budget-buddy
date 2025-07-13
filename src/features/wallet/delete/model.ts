import { createRelationships } from 'tinybase/with-schemas';

import { store } from '~/store';

export function deleteWallet(walletId: string) {
  const relName = 'delWallet_linkedTransactions';
  const rel = createRelationships(store);
  rel.setRelationshipDefinition(relName, 'transactions', 'wallets', 'walletId');
  const transactionIds = rel.getLocalRowIds(relName, walletId);
  rel.delRelationshipDefinition(relName);

  if (transactionIds.length) {
    store.transaction(() => {
      transactionIds.forEach((trId) => {
        store.delRow('transactions', trId);
      });
      store.delRow('wallets', walletId);
    });

    return { success: true };
  } else {
    store.delRow('wallets', walletId);
    return { success: true };
  }
}
