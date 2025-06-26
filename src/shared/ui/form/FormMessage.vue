<script setup lang="ts">
export interface FormMessageProps {
  variant: 'error' | 'helper';
}

const props = defineProps<FormMessageProps>();
</script>

<template>
  <p
    :role="props.variant === 'error' ? 'alert' : 'status'"
    class="helper-text"
    :data-variant="props.variant"
  >
    <slot />
  </p>
</template>
