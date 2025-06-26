// import { useCurrentWalletId } from '~/entities/wallet';
import { validate } from 'superstruct';

import {
  CreatedTransactionScheme,
  type CreatedTransaction,
  type CreatedTransactionErrors,
} from '~/entities/transaction';
// import { useCurrentWallet } from '~/entities/wallet';
// import { useAddRowCallback } from '~/shared/lib/tiny-base';
import { store } from '~/store';

// export function useCreateTransaction() {
//   // const walletId = useCurrentWalletId();
//   const wallet = useCurrentWallet();
//   const cb = useAddRowCallback({
//     store,
//     tableId: 'transactions',
//     // getRow: (parameter, store) => {
//     //   return {};
//     // },
//     then: ({ rowId, row, store }) => {
//       if (rowId) {
//         // const balance = store.getCell('wallets', walletId.value, 'balance')!;
//         // store.setCell(
//         //   'wallets',
//         //   walletId.value,
//         //   'balance',
//         //   balance + row.amount
//         // );
//         // store.setPartialRow('wallets', walletId.value, {
//         //   balance: balance + row.amount,
//         // });
//       } else {
//         // TODO: notify on fail
//       }
//     },
//   });

//   return (transaction: CreatedTransaction) => {
//     // TODO: validate transaction
//     if (transaction.type === 'expense' && wallet.value.totalBalance === 0) {
//       return;
//     }
//     cb(transaction);
//   };
// }

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
