<script setup lang="ts">
import { watch } from 'vue';
import {
  useCurrencyInput,
  type CurrencyInputOptions,
} from 'vue-currency-input';

export interface CurrencyInputProps {
  modelValue: number | null;
  options?: CurrencyInputOptions;
}

const defaultOptions: CurrencyInputOptions = {
  hideCurrencySymbolOnFocus: true,
  currency: 'USD',
  valueRange: { min: 0 },
};

const props = defineProps<CurrencyInputProps>();
const { inputRef, setOptions, setValue } = useCurrencyInput({
  ...defaultOptions,
  ...(props.options ?? {}),
});

watch(
  () => props.options,
  (newOptions) => {
    if (newOptions) setOptions({ ...defaultOptions, ...newOptions });
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
