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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'radix-vue';

export type SortByValue =
  | 'date:desc'
  | 'date:asc'
  | 'amount:desc'
  | 'amount:asc';

const sortModel = defineModel<string>('sort');
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger as-child>
      <slot />
    </DropdownMenuTrigger>

    <DropdownMenuPortal>
      <DropdownMenuContent class="dropdown__content">
        <DropdownMenuArrow class="dropdown__arrow" />

        <DropdownMenuRadioGroup v-model="sortModel">
          <DropdownMenuRadioItem class="dropdown__item" value="date:desc">
            <DropdownMenuItemIndicator class="dropdown__menu-item-indicator">
              <DotIcon :size="16" />
            </DropdownMenuItemIndicator>
            Newest
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem class="dropdown__item" value="date:asc">
            <DropdownMenuItemIndicator class="dropdown__menu-item-indicator">
              <DotIcon :size="16" />
            </DropdownMenuItemIndicator>
            Oldest
          </DropdownMenuRadioItem>

          <DropdownMenuSeparator class="dropdown__separator" />

          <DropdownMenuRadioItem class="dropdown__item" value="amount:desc">
            <DropdownMenuItemIndicator class="dropdown__menu-item-indicator">
              <DotIcon :size="16" />
            </DropdownMenuItemIndicator>
            Highest amount first
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem class="dropdown__item" value="amount:asc">
            <DropdownMenuItemIndicator class="dropdown__menu-item-indicator">
              <DotIcon :size="16" />
            </DropdownMenuItemIndicator>
            Lowest amount first
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
