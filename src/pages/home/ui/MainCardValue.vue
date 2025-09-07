<template>
  <p class="main-value">
    <slot />
  </p>
</template>

<style lang="scss" scoped>
@use '@globals/tools' as t;

.main-value {
  font-size: t.px-to-rem(28px);
  line-height: t.lh-ratio(28px);
  font-weight: 600;
}
</style>
