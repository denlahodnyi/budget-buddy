import { reactive } from 'vue';

// import * as some from './new_store';
export interface Transaction {
  type: 'expense' | 'income';
  amount: number;
  date: Date;
}

interface Store {
  transactions: Transaction[];
}

export const store = reactive<Store>({
  transactions: [],
});
