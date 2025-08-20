<script setup lang="ts">
import { CheckIcon } from 'lucide-vue-next';
import { CheckboxIndicator, CheckboxRoot } from 'radix-vue';

defineOptions({
  inheritAttrs: false,
});

const model = defineModel<boolean>({ default: false });
</script>

<template>
  <span class="checkbox">
    <CheckboxRoot
      v-bind="$attrs"
      v-model:checked="model"
      :class="['checkbox__root', $attrs.class]"
    >
      <CheckboxIndicator class="checkbox__indicator">
        <CheckIcon :size="18" />
      </CheckboxIndicator>
    </CheckboxRoot>
  </span>
</template>

<style lang="scss" scoped>
@use '@globals/tools' as t;

$accent: t.get-color-var('accent');
$accent-foreground: t.get-color-var('accent-foreground');
$input: t.get-color-var('input');

:where(:deep(.checkbox__root)) {
  --_color: var(--color, #{var($accent)});

  inline-size: 25px;
  block-size: 25px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var($input);
  border-radius: 4px;
  background-color: transparent;
  transition: background-color 0.1s ease-in-out;
  box-shadow: 0 0px 2px #c9c9c9;

  &:focus-visible {
    @include t.focus-vis;
  }
}

:where(:deep(.checkbox__root[data-state='checked'])) {
  color: var($accent-foreground);
  background-color: var(--_color);

  &:hover {
    background-color: color-mix(in hsl, var($accent), transparent 10%);
  }
}
</style>
