<script setup lang="ts">
import { DotIcon } from 'lucide-vue-next';
import {
  DropdownMenuArrow,
  DropdownMenuContent,
  DropdownMenuItemIndicator,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from 'radix-vue';
import { computed } from 'vue';

export type FilterValue = '3d' | '7d' | '30d' | '90d' | '1m' | '<1m' | '1y';

const options: { value: FilterValue; label: string }[] = [
  { value: '3d', label: 'Last 3 days' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1m', label: 'This month' },
  { value: '<1m', label: 'Previous month' },
  { value: '1y', label: 'This year' },
];

const filterModel = defineModel<string>({ default: '3d' });

const selectedVal = computed(() => {
  return options.find((o) => o.value === filterModel.value)!;
});
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger as-child>
      <slot :selected-value="selectedVal" />
    </DropdownMenuTrigger>

    <DropdownMenuPortal>
      <DropdownMenuContent class="dropdown__content">
        <DropdownMenuArrow class="dropdown__arrow" />

        <DropdownMenuRadioGroup v-model="filterModel">
          <template v-for="{ value, label } in options" :key="value">
            <DropdownMenuRadioItem class="dropdown__item" :value="value">
              <DropdownMenuItemIndicator class="dropdown__menu-item-indicator">
                <DotIcon :size="16" />
              </DropdownMenuItemIndicator>
              {{ label }}
            </DropdownMenuRadioItem>
          </template>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
