import { validate } from 'superstruct';

import {
  CreatedWalletScheme,
  type CreatedWallet,
  type CreatedWalletErrors,
} from '~/entities/wallet';
import { store } from '~/store';

export function createWallet(wallet: CreatedWallet) {
  // TODO: refactor validation common logic
  const [err, obj] = validate(wallet, CreatedWalletScheme, {
    coerce: true,
  });
  if (err) {
    const errors: CreatedWalletErrors = {};
    for (const failure of err.failures()) {
      errors[failure.key as keyof CreatedWalletErrors] = failure.message;
    }
    return { success: false, errors } as const;
  }
  const walletId = store.addRow('wallets', obj);
  return { success: true, walletId } as const;
}
