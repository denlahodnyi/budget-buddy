<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';

import { HomePage } from '~/pages/home';
import { initiateStorePersister } from './store';

const isStoreReady = ref(false);

onBeforeMount(() => {
  initiateStorePersister().then(() => {
    isStoreReady.value = true;
  });
});
</script>

<template>
  <Transition name="overlay-fade">
    <div
      v-show="!isStoreReady"
      data-testid="loader-overlay"
      class="loader-overlay"
    >
      <span>Budget Buddy</span>
      <div style="min-height: 20px; line-height: 0">
        <Transition name="txt-fade">
          <span v-show="!isStoreReady">Preparing data</span>
        </Transition>
      </div>
    </div>
  </Transition>
  <HomePage v-show="isStoreReady" :inert="!isStoreReady" />
</template>

<style lang="scss">
@use '@globals/tools' as t;

#app {
  box-sizing: content-box; // children max-height must exclude paddings
  overflow: hidden;
  min-height: calc(100svh - 40px);
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

.loader-overlay {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(t.get-color-var('background'));
  user-select: none;
  & > :first-child {
    font-size: 80px;
    font-family: MsMadi, cursive;
    color: var(t.get-color-var('primary'));
  }
}

.overlay-fade-leave-active {
  transition: all 0.5s 0.6s cubic-bezier(0.17, 0.67, 0.29, 0.89);
}
.overlay-fade-leave-to {
  opacity: 0;
}
.txt-fade-leave-active {
  transition: opacity 0.6s linear;
}
.txt-fade-leave-to {
  opacity: 0;
}
</style>
