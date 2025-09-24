import { validate } from 'superstruct';

import {
  CreatedUserScheme,
  type CreatedUser,
  type CreatedUserErrors,
} from '~/entities/user';
import { store } from '~/store';

export function createUser(user: CreatedUser) {
  const [err, obj] = validate(user, CreatedUserScheme, {
    coerce: true,
  });
  if (err) {
    const errors: CreatedUserErrors = {};
    for (const failure of err.failures()) {
      errors[failure.key as keyof CreatedUserErrors] = failure.message;
    }
    return { success: false, errors } as const;
  }
  const userId = store.addRow('users', obj);
  return { success: true, userId } as const;
}

export function editUser(
  userId: string,
  partiallyEditedUser: Partial<CreatedUser>
) {
  const [err, obj] = validate(partiallyEditedUser, CreatedUserScheme, {
    coerce: true,
  });
  if (err) {
    const errors: CreatedUserErrors = {};
    for (const failure of err.failures()) {
      errors[failure.key as keyof CreatedUserErrors] = failure.message;
    }
    return { success: false, errors } as const;
  }
  store.setPartialRow('users', userId, obj);
  return { success: true } as const;
}
