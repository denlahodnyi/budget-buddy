// import { useCurrentWalletId } from '~/entities/wallet';
import type { Transaction } from '~/entities/transaction';
import { useCurrentWallet } from '~/entities/wallet';
import { useAddRowCallback } from '~/shared/lib/tiny-base';
import { store } from '~/store';

type NewTransaction = {
  type: Transaction['type'];
  amount: number;
  userId: string;
  walletId: string;
  createdAt: string;
};

export function useCreateTransaction() {
  // const walletId = useCurrentWalletId();
  const wallet = useCurrentWallet();
  const cb = useAddRowCallback({
    store,
    tableId: 'transactions',
    // getRow: (parameter, store) => {
    //   return {};
    // },
    then: ({ rowId, row, store }) => {
      if (rowId) {
        // const balance = store.getCell('wallets', walletId.value, 'balance')!;
        // store.setCell(
        //   'wallets',
        //   walletId.value,
        //   'balance',
        //   balance + row.amount
        // );
        // store.setPartialRow('wallets', walletId.value, {
        //   balance: balance + row.amount,
        // });
      } else {
        // TODO: notify on fail
      }
    },
  });

  return (transaction: NewTransaction) => {
    // TODO: validate transaction
    if (transaction.type === 'expense' && wallet.value.totalBalance === 0) {
      return;
    }
    cb(transaction);
  };
}
