<script setup lang="ts">
import { CheckIcon, ChevronDownIcon, XIcon } from 'lucide-vue-next';
import {
  ComboboxAnchor,
  ComboboxCancel,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxViewport,
  type ComboboxInputProps,
} from 'radix-vue';
import { ref, toRef, type InputHTMLAttributes } from 'vue';

import { useUserCurrencies } from '../model';

export interface CurrencySelectProps {
  userId: string;
  inputId?: string;
  inputProps?: ComboboxInputProps & InputHTMLAttributes;
}

const {
  userId,
  inputId = '',
  inputProps = {},
} = defineProps<CurrencySelectProps>();

const currencies = useUserCurrencies(toRef(() => userId));
const searchTerm = ref('');

const filterFunc = (ids: string[]) => {
  return searchTerm.value === ''
    ? ids
    : Object.keys(currencies.value).filter((cId) => {
        const c = currencies.value[cId]!;
        return `(${c.code}) ${c.name}`
          .toLowerCase()
          .includes(searchTerm.value.toLowerCase());
      });
};
</script>

<template>
  <ComboboxRoot
    v-model:search-term="searchTerm"
    class="combobox"
    :display-value="(id: string) => currencies[id] ? currencies[id].code : ''"
    :filter-function="filterFunc"
  >
    <ComboboxAnchor class="combobox__anchor">
      <ComboboxInput
        :id="inputId"
        class="combobox__input"
        autocomplete="off"
        v-bind="inputProps"
      />
      <ComboboxCancel
        v-show="searchTerm"
        class="combobox__icon combobox__cancel"
      >
        <XIcon />
      </ComboboxCancel>
      <ComboboxTrigger class="combobox__icon combobox__trigger">
        <ChevronDownIcon />
      </ComboboxTrigger>
    </ComboboxAnchor>

    <ComboboxPortal>
      <ComboboxContent position="popper" class="combobox__content">
        <ComboboxViewport class="combobox__viewport">
          <ComboboxEmpty class="combobox__empty" />
          <template v-for="(c, cId) in currencies" :key="cId">
            <ComboboxItem :value="cId" class="combobox__item">
              <ComboboxItemIndicator class="combobox__item-indicator">
                <CheckIcon :size="16" />
              </ComboboxItemIndicator>
              <span>({{ c!.code }}) {{ c!.name }}</span>
            </ComboboxItem>
          </template>
        </ComboboxViewport>
      </ComboboxContent>
    </ComboboxPortal>
  </ComboboxRoot>
</template>
