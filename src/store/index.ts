import type { Store } from 'tinybase';
import { createIndexedDbPersister } from 'tinybase/persisters/persister-indexed-db';
import { createQueries, createStore } from 'tinybase/with-schemas';

import { CATEGORY_COLORS, CATEGORY_ICONS } from './data/categories';
import categoriesData from './data/categories.json';
import { DEFAULT_CURRENCIES } from './data/currencies';
import { setMockData } from './data/mocks';
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
      DEFAULT_CURRENCIES.forEach((c) => {
        s.addRow('currencies', c);
      });
      if (import.meta.env.DEV && import.meta.env.MODE !== 'unmocked') {
        setMockData(s);
      }
      s.setValue('firstInit', false);
    });
  }
}

function setCategories(s: typeof store) {
  categoriesData.forEach((cat) => {
    const { children, ...rest } = cat;
    const rowId = s.addRow('categories', { ...rest });
    if (children) {
      children.forEach((ch) => {
        s.addRow('categories', { ...ch, parentId: rowId });
      });
    }
  });
}

// TODO: remove on prod
store.addTablesListener((store) => {
  console.log('STORE CHANGED: ', store.getTables());
});

// TODO: remove on prod
queries.addQueryIdsListener((queries) => {
  console.log('QUERIES IDS', queries.getQueryIds());
});

export {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  DEFAULT_CURRENCIES,
  initiateStorePersister,
  queries,
  store,
};
export * from './store-config';
export * from './queries/balance';
export * from './queries/category';
export * from './queries/expense';
export * from './queries/income';
export * from './queries/transaction';
export * from './queries/wallets';
export * from './queries/currency';
