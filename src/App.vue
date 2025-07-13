<script setup lang="ts">
import { HomePage } from '~/pages/home';
</script>

<template>
  <HomePage />
</template>

<style lang="scss">
@use '@globals/tools' as t;

#app {
  box-sizing: content-box; // children max-height must exclude paddings
  overflow: hidden;
  min-height: 100svh;
  max-height: 110svh;
  padding-block: 20px;
  display: grid;
  grid-template-columns:
    1fr [content-start] min(100% - 60px, t.px-to-rem(1024px))
    [content-end] 1fr;
  align-items: flex-start;

  & > * {
    grid-column: content;
  }
}
</style>
