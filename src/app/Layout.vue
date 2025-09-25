<script setup lang="ts">
import { CogIcon } from 'lucide-vue-next';
import { useRoute } from 'vue-router';

import UserSwitch from './ui/UserSwitch.vue';

const route = useRoute();
</script>

<template>
  <div class="app-layout">
    <header id="app-header" class="app-header">
      <div>
        <UserSwitch mount-to="#app-header" />
        <RouterLink
          v-if="route.path !== '/settings'"
          to="/settings"
          aria-label="Settings link"
          class="btn"
          data-variant="ghost"
          data-size="icon"
        >
          <CogIcon :size="30" />
        </RouterLink>
      </div>
    </header>
    <RouterView />
  </div>
</template>

<style lang="scss" scoped>
@use '@globals/tools' as t;

.app-layout {
  min-height: 100svh;
  // max-height: 150svh;
  display: grid;
  grid-template-columns:
    1fr [content-start] min(100% - 60px, t.px-to-rem(1024px))
    [content-end] 1fr;
  grid-template-rows: min-content min-content min-content 1fr;

  & > * {
    grid-column: content;
  }
}

.app-header {
  position: sticky;
  top: 0;
  z-index: var(t.get-z-var('middle'));
  padding-block: 20px;
  grid-column: 1 / -1 !important;
  display: grid;
  grid-template-columns: subgrid;
  border-bottom: 1px solid var(t.get-color-var('border'));
  background-color: var(t.get-color-var('card'));
  & > * {
    grid-column: content;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 20px;
  }
}
</style>
