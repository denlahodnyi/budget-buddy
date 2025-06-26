import { validate } from 'superstruct';

import {
  CreatedTransactionScheme,
  type CreatedTransaction,
  type CreatedTransactionErrors,
} from '~/entities/transaction';
import { store } from '~/store';

export function editTransaction(
  transactionId: string,
  partiallyEditedTransaction: Partial<CreatedTransaction>
) {
  const [err, obj] = validate(
    partiallyEditedTransaction,
    CreatedTransactionScheme,
    { coerce: true }
  );
  if (err) {
    const errors: CreatedTransactionErrors = {};
    for (const failure of err.failures()) {
      errors[failure.key as keyof CreatedTransactionErrors] = failure.message;
    }
    return { success: false, errors } as const;
  } else {
    store.setPartialRow('transactions', transactionId, obj);
    return { success: true } as const;
  }
}
