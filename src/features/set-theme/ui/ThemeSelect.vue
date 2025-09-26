<script lang="ts" setup>
import {
  DotIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
  SunMoonIcon,
} from 'lucide-vue-next';
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
import { ref, watchEffect } from 'vue';

import { getTheme, saveTheme, setTheme, type Theme } from '../model';

const { mountTo = 'body' } = defineProps<{
  mountTo?: HTMLElement | string;
}>();

const theme = ref<Theme>(getTheme() || 'system');

watchEffect(() => {
  saveTheme(theme.value);
  setTheme(theme.value);
});
</script>

<template>
  <DropdownMenuRoot class="dropdown">
    <DropdownMenuTrigger as-child>
      <button class="btn theme-select__trigger" data-variant="outline">
        <SunMoonIcon :size="20" />
        Theme
      </button>
    </DropdownMenuTrigger>

    <DropdownMenuPortal :to="mountTo">
      <DropdownMenuContent class="dropdown__content">
        <DropdownMenuRadioGroup v-model="theme">
          <DropdownMenuRadioItem class="dropdown__item" value="system">
            <DropdownMenuItemIndicator class="dropdown__menu-item-indicator">
              <DotIcon :size="16" />
            </DropdownMenuItemIndicator>
            <MonitorIcon :size="18" />
            System
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem class="dropdown__item" value="dark">
            <DropdownMenuItemIndicator class="dropdown__menu-item-indicator">
              <DotIcon :size="16" />
            </DropdownMenuItemIndicator>
            <MoonIcon :size="18" />
            Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem class="dropdown__item" value="light">
            <DropdownMenuItemIndicator class="dropdown__menu-item-indicator">
              <DotIcon :size="16" />
            </DropdownMenuItemIndicator>
            <SunIcon :size="18" />
            Light
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuArrow class="dropdown__arrow" />
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>

<style lang="scss" scoped>
@use '@globals/tools' as t;

.theme-select__trigger {
  block-size: auto;
  padding-block: 6px;
  gap: 16px;
  font-size: t.px-to-rem(18px);
}
</style>
