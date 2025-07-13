import { createQueries, createStore } from 'tinybase/with-schemas';

import categoriesData from './categories.json';
import { storeTablesSchema, storeValuesSchema } from './store-config';

const store = createStore()
  .setTablesSchema(storeTablesSchema)
  .setValuesSchema(storeValuesSchema);

const queries = createQueries(store);

store.setTables({
  users: {
    '0': {
      name: 'John Doe',
    },
    '1': {
      name: 'Jack Daniels',
    },
  },
  wallets: {
    '0': {
      userId: '0',
      name: 'My Wallet',
      // balance: 2000,
    },
    '1': {
      userId: '1',
      name: 'Jack Wallet',
      // balance: 400,
    },
  },
  transactions: {
    // '0': {
    //   amount: 2000,
    //   type: 'income',
    //   userId: '0',
    //   walletId: '0',
    // },
    // '1': {
    //   amount: 400,
    //   type: 'income',
    //   userId: '1',
    //   walletId: '1',
    // },
  },
});

categoriesData.forEach((cat) => {
  const { children, ...rest } = cat;
  const rowId = store.addRow('categories', { ...rest, userId: '0' });
  if (children) {
    children.forEach((ch) => {
      store.addRow('categories', { ...ch, parentId: rowId, userId: '0' });
    });
  }
});

store.addTablesListener((store) => {
  console.log('STORE CHANGED: ', store.getTables());
});

queries.addQueryIdsListener((queries) => {
  console.log('QUERIES IDS', queries.getQueryIds());
});

export { queries, store };
export * from './store-config';
export * from './store-queries';
