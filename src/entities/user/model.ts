import { useRow, useValue } from '~/shared/lib/tiny-base';
import { store } from '~/store';

export function useCurrentUserId() {
  return useValue({ store, valueId: () => 'userId' });
}

export function useCurrentUser() {
  const userId = useCurrentUserId();
  return useRow({ store, tableId: () => 'users', rowId: userId });
}
