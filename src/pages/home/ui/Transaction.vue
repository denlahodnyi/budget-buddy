<script setup lang="ts">
import { useTransaction } from '~/entities/transaction';

interface TransactionProps {
  id: string;
}

const props = defineProps<TransactionProps>();
const t = useTransaction(() => props.id);
</script>

<template>
  <section class="transaction">
    <p>{{ t.type }}</p>
    <p>{{ t.formattedAmount }}</p>
    <p>{{ new Date(t.createdAt).toLocaleDateString() }}</p>
  </section>
</template>

<style lang="scss" scoped>
@use '@globals/tools' as t;

.transaction {
  padding: 6px 8px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  border: 1px solid
    color-mix(in hsl, var(t.get-color-var('border')), transparent 50%);
  border-radius: t.px-to-rem(8px);
  color: inherit;
  background-color: transparent;
}
</style>
