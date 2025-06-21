import { createStore } from 'tinybase';
import {
  createQueries,
  type OptionalSchemas,
  type Store,
} from 'tinybase/with-schemas';

export function createTestStore() {
  return createStore()
    .setTables({
      pets: { fido: { species: 'dog' } },
      species: { dog: { price: 5 } },
    })
    .setValues({ name: 'John', age: 30 }) as unknown as Store<OptionalSchemas>;
}

export function createTestStoreQueries(store: Store<OptionalSchemas>) {
  const queries = createQueries(store);
  queries.setQueryDefinition('dogSpeciesQuery', 'pets', ({ select, where }) => {
    select('species');
    where('species', 'dog');
  });
  queries.setQueryDefinition('catSpeciesQuery', 'pets', ({ select, where }) => {
    select('species');
    where('species', 'cat');
  });
  return { queries };
}

export function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve));
}
