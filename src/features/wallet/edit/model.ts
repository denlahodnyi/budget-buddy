import { validate } from 'superstruct';

import {
  CreatedWalletScheme,
  type CreatedWallet,
  type CreatedWalletErrors,
} from '~/entities/wallet';
import { store } from '~/store';

export function editWallet(
  walletId: string,
  partiallyEditedWallet: Partial<CreatedWallet>
) {
  // TODO: refactor validation common logic
  const [err, obj] = validate(partiallyEditedWallet, CreatedWalletScheme, {
    coerce: true,
  });
  if (err) {
    const errors: CreatedWalletErrors = {};
    for (const failure of err.failures()) {
      errors[failure.key as keyof CreatedWalletErrors] = failure.message;
    }
    return { success: false, errors } as const;
  }
  store.setPartialRow('wallets', walletId, obj);
  return { success: true } as const;
}
