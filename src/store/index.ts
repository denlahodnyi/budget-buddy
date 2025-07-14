import type { Store } from 'tinybase';
import { createIndexedDbPersister } from 'tinybase/persisters/persister-indexed-db';
import { createQueries, createStore } from 'tinybase/with-schemas';

import categoriesData from './categories.json';
import { storeTablesSchema, storeValuesSchema } from './store-config';

const LOCAL_DB_NAME = 'budget_store';

const store = createStore()
  .setTablesSchema(storeTablesSchema)
  .setValuesSchema(storeValuesSchema);

const queries = createQueries(store);

async function initiateStorePersister() {
  const persister = createIndexedDbPersister(
    store as unknown as Store,
    LOCAL_DB_NAME
  );

  const readyPersister = await persister.startAutoPersisting([
    {
      users: {
        '0': {
          name: 'User #1',
        },
      },
      wallets: {
        '0': {
          name: 'My Wallet',
        },
      },
    },
    {
      firstInit: true,
    },
  ]);

  const s = readyPersister.getStore() as unknown as typeof store;

  if (s.getValue('firstInit')) {
    s.transaction(() => {
      setCategories(s);
      s.setValue('firstInit', false);
    });
  }
}

function setCategories(s: typeof store) {
  categoriesData.forEach((cat) => {
    const { children, ...rest } = cat;
    const rowId = s.addRow('categories', { ...rest, userId: '0' });
    if (children) {
      children.forEach((ch) => {
        s.addRow('categories', { ...ch, parentId: rowId, userId: '0' });
      });
    }
  });
}

store.addTablesListener((store) => {
  console.log('STORE CHANGED: ', store.getTables());
});

queries.addQueryIdsListener((queries) => {
  console.log('QUERIES IDS', queries.getQueryIds());
});

export { initiateStorePersister, queries, store };
export * from './store-config';
export * from './queries/balance';
export * from './queries/category';
export * from './queries/expense';
export * from './queries/income';
export * from './queries/transaction';
export * from './queries/wallets';
