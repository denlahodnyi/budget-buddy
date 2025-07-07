import { validate } from 'superstruct';

import {
  CreatedTransactionScheme,
  type CreatedTransaction,
  type CreatedTransactionErrors,
} from '~/entities/transaction';
import { store } from '~/store';

export function createTransaction(transaction: CreatedTransaction) {
  const [err, obj] = validate(transaction, CreatedTransactionScheme, {
    coerce: true,
  });
  if (err) {
    const errors: CreatedTransactionErrors = {};
    for (const failure of err.failures()) {
      errors[failure.key as keyof CreatedTransactionErrors] = failure.message;
    }
    return { success: false, errors } as const;
  }
  const transactionId = store.addRow('transactions', obj);
  return { success: true, transactionId } as const;
}
