import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import { createTestStore, flushPromises } from '../test-utils';
import { useValue, useValueListener } from './value';

describe('The useValueListener composable', () => {
  it('calls listener whenever value changes', () => {
    const store = createTestStore();
    const listener = vi.fn();

    useValueListener({
      store,
      valueId: () => 'name',
      listener,
      mutator: () => false,
    });

    store.setValue('name', 'Bob');

    expect(listener).toHaveBeenCalledOnce();
  });

  it('registers new listener when value id changes', async () => {
    const store = createTestStore();
    const valueId = ref('name');
    const listener = vi.fn();

    useValueListener({
      store,
      valueId,
      listener,
      mutator: () => false,
    });

    store.setValue('name', 'Bob');
    valueId.value = 'age';
    await flushPromises();
    store.setValue('age', 20);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});

describe('The useValue composable', () => {
  it('returns the current value and updates when it changes', () => {
    const store = createTestStore();
    const testValue = useValue({
      store,
      valueId: () => 'name',
    });

    expect(testValue.value).toBe('John');
    store.setValue('name', 'Alice');
    expect(testValue.value).toBe('Alice');
  });
});
