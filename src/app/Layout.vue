<script setup lang="ts">
import { CogIcon } from 'lucide-vue-next';
</script>

<template>
  <div class="app-layout">
    <header class="app-header">
      <RouterLink
        to="/settings"
        aria-label="Settings link"
        class="btn"
        data-variant="ghost"
        data-size="icon"
      >
        <CogIcon :size="30" />
      </RouterLink>
    </header>
    <RouterView />
  </div>
</template>

<style lang="scss" scoped>
@use '@globals/tools' as t;

.app-layout {
  min-height: 100svh;
  max-height: 110svh;
  display: grid;
  grid-template-columns:
    1fr [content-start] min(100% - 60px, t.px-to-rem(1024px))
    [content-end] 1fr;
  grid-template-rows: min-content 1fr;

  & > * {
    grid-column: content;
  }
}

.app-header {
  position: sticky;
  top: 0;
  padding-block: 20px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  border-bottom: 1px solid var(t.get-color-var('border'));
  background-color: var(t.get-color-var('background'));
}
</style>
