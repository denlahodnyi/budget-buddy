import { store } from '~/store';

export function deleteTransaction(transactionId: string) {
  store.delRow('transactions', transactionId);
}
