import type {
  Id,
  IdOrNull,
  OptionalSchemas,
  Store,
  ValueListener,
} from 'tinybase/with-schemas';
import {
  onWatcherCleanup,
  shallowRef,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue';

import type { ValueIdFromSchema } from './util-types';

export function useValueListener<TSchemas extends OptionalSchemas>(args: {
  valueId: MaybeRefOrGetter<IdOrNull>;
  listener: ValueListener<
    TSchemas,
    ValueIdFromSchema<TSchemas[1]> | null,
    Store<TSchemas>
  >;
  mutator?: MaybeRefOrGetter<boolean>;
  store: Store<TSchemas>;
}) {
  const { valueId, listener, mutator, store } = args;

  watch(
    [valueId, mutator],
    ([newValueId, newMutator]) => {
      let listenerId: Id;

      if (store) {
        listenerId = store.addValueListener(
          toValue(newValueId as MaybeRefOrGetter<IdOrNull>),
          listener,
          toValue(newMutator as MaybeRefOrGetter<boolean>)
        );
      }

      onWatcherCleanup(() => {
        store.delListener(listenerId);
      });
    },
    { immediate: true }
  );
}

export function useValue<TSchemas extends OptionalSchemas>(args: {
  valueId: MaybeRefOrGetter<ValueIdFromSchema<TSchemas[1]>>;
  store: Store<TSchemas>;
}) {
  const { valueId, store } = args;
  const value = shallowRef(store.getValue(toValue(valueId)));
  useValueListener({
    valueId,
    listener: () => {
      value.value = store.getValue(toValue(valueId));
    },
    mutator: () => true,
    store,
  });

  return value;
}
