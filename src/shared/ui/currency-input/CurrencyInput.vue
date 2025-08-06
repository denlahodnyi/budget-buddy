<script setup lang="ts">
import { watch } from 'vue';
import {
  useCurrencyInput,
  type CurrencyDisplay,
  type CurrencyInputOptions,
} from 'vue-currency-input';

export interface CurrencyInputProps {
  modelValue: number | null;
  options?: Omit<CurrencyInputOptions, 'currencyDisplay'> & {
    currencyDisplay?: keyof typeof CurrencyDisplay; // use union instead of enum
  };
}

const defaultOptions: CurrencyInputOptions = {
  hideCurrencySymbolOnFocus: true,
  currency: 'USD',
  valueRange: { min: 0 },
};

const props = defineProps<CurrencyInputProps>();
const { inputRef, setOptions, setValue } = useCurrencyInput({
  ...defaultOptions,
  ...((props.options ?? {}) as CurrencyInputOptions),
  ...(props.options?.currencyDisplay
    ? { currencyDisplay: props.options.currencyDisplay as CurrencyDisplay }
    : {}),
});

watch(
  () => props.options,
  (newOptions) => {
    const { currencyDisplay, ...rest } = newOptions ?? {};
    if (newOptions)
      setOptions({
        ...defaultOptions,
        currencyDisplay: currencyDisplay as CurrencyDisplay,
        ...rest,
      });
  }
);

watch(
  () => props.modelValue,
  (newValue) => {
    setValue(newValue);
  }
);
</script>

<template>
  <input ref="inputRef" type="text" class="input" />
</template>
