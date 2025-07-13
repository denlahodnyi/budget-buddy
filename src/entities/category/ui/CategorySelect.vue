<script setup lang="ts">
import { CheckIcon, ChevronDownIcon, UnlinkIcon, XIcon } from 'lucide-vue-next';
import {
  ComboboxAnchor,
  ComboboxCancel,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxViewport,
  type ComboboxInputProps,
} from 'radix-vue';
import { computed, ref, toRef, type InputHTMLAttributes } from 'vue';

import { makeNestedCategories } from '../lib';
import { useFullCategories, type Category } from '../model';
import { NO_PARENT_VAL } from './config';

export interface CategoriesSelectProps {
  userId: string;
  categoryType: Category['type'] | 'all';
  inputId?: string;
  inputProps?: ComboboxInputProps & InputHTMLAttributes;
  onlyParents?: boolean;
  showNoParentOption?: boolean;
  excludedCategories?: string[];
}

const {
  userId,
  categoryType,
  inputId = '',
  inputProps = {},
  onlyParents = false,
  showNoParentOption = true,
  excludedCategories = [],
} = defineProps<CategoriesSelectProps>();

const { categories: originalList } = useFullCategories(
  toRef(() => userId),
  toRef(() => categoryType),
  toRef(() => onlyParents),
  toRef(() => excludedCategories)
);
const searchTerm = ref('');
const nested = computed(() => makeNestedCategories(originalList.value));

const handleFilter = (valuesList: string[]) => {
  if (searchTerm.value === '') return valuesList;

  const matchInChildren = new Set<string>();
  let nestedCopy = structuredClone(nested.value);

  nestedCopy = nestedCopy.filter((cat) => {
    return (
      nameMatches(cat.name, searchTerm.value) ||
      (!onlyParents &&
        cat.children.some((sub) => nameMatches(sub.name, searchTerm.value)) &&
        matchInChildren.add(cat.id))
    );
  });

  if (matchInChildren.size) {
    nestedCopy.forEach((c) => {
      if (matchInChildren.has(c.id)) {
        c.children = c.children.filter((cat) =>
          nameMatches(cat.name, searchTerm.value)
        );
      }
    });
  }

  return nestedCopy
    .map((o) => (o.children.length ? o.children.map((ch) => ch.id) : o.id))
    .flat();
};

const nameMatches = (name: string, searchTerm: string) => {
  return name.toLowerCase().includes(searchTerm.toLowerCase());
};
</script>

<template>
  <ComboboxRoot
    v-model:search-term="searchTerm"
    class="combobox"
    :display-value="(v: string) => v === NO_PARENT_VAL ? 'No parent' : originalList.get(v)?.name!"
    :filter-function="handleFilter"
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

          <ComboboxGroup v-if="showNoParentOption">
            <ComboboxItem :value="NO_PARENT_VAL" class="combobox__item">
              <ComboboxItemIndicator class="combobox__item-indicator">
                <CheckIcon :size="16" />
              </ComboboxItemIndicator>
              <span>No parent</span>
              <UnlinkIcon :size="12" style="margin-inline-start: 10px" />
            </ComboboxItem>
            <ComboboxSeparator class="combobox__separator" />
          </ComboboxGroup>

          <template v-for="parentCat of nested" :key="parentCat.id">
            <template v-if="parentCat.children.length">
              <ComboboxGroup>
                <ComboboxLabel class="combobox__group-label">
                  {{ parentCat.name }}
                </ComboboxLabel>
                <ComboboxItem
                  v-for="subCat of parentCat.children"
                  :key="subCat.id"
                  :value="subCat.id"
                  class="combobox__item"
                >
                  <ComboboxItemIndicator class="combobox__item-indicator">
                    <CheckIcon :size="16" />
                  </ComboboxItemIndicator>
                  <span>{{ subCat.name }}</span>
                </ComboboxItem>
                <ComboboxSeparator class="combobox__separator" />
              </ComboboxGroup>
            </template>

            <ComboboxItem v-else :value="parentCat.id" class="combobox__item">
              <ComboboxItemIndicator class="combobox__item-indicator">
                <CheckIcon :size="16" />
              </ComboboxItemIndicator>
              <span>{{ parentCat.name }}</span>
            </ComboboxItem>
          </template>
        </ComboboxViewport>
      </ComboboxContent>
    </ComboboxPortal>
  </ComboboxRoot>
</template>
