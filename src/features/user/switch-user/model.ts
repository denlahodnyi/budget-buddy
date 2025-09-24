import { store } from '~/store';

export function switchUser(userId: string) {
  store.setValue('userId', userId);
}
