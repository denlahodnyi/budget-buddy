<script setup lang="ts">
const { isVisible } = defineProps<{ isVisible: boolean }>();
</script>

<template>
  <Transition name="overlay-fade">
    <div v-show="isVisible" data-testid="loader-overlay" class="loader-overlay">
      <slot />
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
@use '@globals/tools' as t;

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
}

.overlay-fade-leave-active {
  transition: all 0.5s 0.6s cubic-bezier(0.17, 0.67, 0.29, 0.89);
}
.overlay-fade-leave-to {
  opacity: 0;
}
</style>
