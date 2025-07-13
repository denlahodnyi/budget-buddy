<script setup lang="ts">
import { EllipsisVerticalIcon, PencilIcon, TrashIcon } from 'lucide-vue-next';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from 'radix-vue';
import { ref, toRef } from 'vue';

import { useTransaction } from '~/entities/transaction';
import { deleteTransaction } from '~/features/transaction/delete';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '~/store';
import TransactionDelAlert from './TransactionDelAlert.vue';
import TransactionDialog from './TransactionDialog.vue';

interface TransactionProps {
  id: string;
}

const props = defineProps<TransactionProps>();

const t = useTransaction(toRef(() => props.id));
const isActionsDropdownOpen = ref(false);
const isEditDialogOpen = ref(false);
const isAlertOpen = ref(false);

function handleDialogOpenChange(open: boolean) {
  isEditDialogOpen.value = open;
  if (!open) {
    isActionsDropdownOpen.value = false;
  }
}
function handleAlertOpenChange(open: boolean) {
  isAlertOpen.value = open;
}
function handleDropdownOpenChange(open: boolean) {
  isActionsDropdownOpen.value = open;
}
</script>

<template>
  <section class="transaction" :data-testid="`transaction_${props.id}`">
    <div
      :style="{ backgroundColor: CATEGORY_COLORS[t.category.color] }"
      class="transaction__color-indicator"
    />
    <component
      :is="CATEGORY_ICONS[t.category.icon]"
      class="transaction__icon"
    />
    <div>
      <p class="transaction__name">{{ t.category.name }}</p>
      <p class="transaction__date">
        {{ new Date(t.createdAt).toLocaleDateString() }}
      </p>
    </div>
    <p class="transaction__wallet">{{ t.wallet.name }}</p>
    <p
      :class="[
        'transaction__amount',
        t.type === 'income'
          ? 'transaction__amount--positive'
          : 'transaction__amount--negative',
      ]"
    >
      {{ t.formattedAmount }}
    </p>

    <DropdownMenuRoot
      class="dropdown"
      :open="isActionsDropdownOpen"
      @update:open="handleDropdownOpenChange"
    >
      <DropdownMenuTrigger as-child>
        <button
          class="btn"
          data-variant="outline"
          data-size="icon"
          aria-label="More options"
        >
          <EllipsisVerticalIcon />
        </button>
        <DropdownMenuPortal>
          <DropdownMenuContent
            class="dropdown__content"
            :hidden="isEditDialogOpen"
          >
            <TransactionDialog
              :transaction-id="props.id"
              @update:open="handleDialogOpenChange"
            >
              <DropdownMenuItem class="dropdown__item" @select.prevent>
                <PencilIcon :size="16" />Edit
              </DropdownMenuItem>
            </TransactionDialog>
            <TransactionDelAlert
              @update:open="handleAlertOpenChange"
              @confirm="deleteTransaction(props.id)"
            >
              <DropdownMenuItem class="dropdown__item" @select.prevent>
                <TrashIcon :size="16" />Delete
              </DropdownMenuItem>
            </TransactionDelAlert>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenuTrigger>
    </DropdownMenuRoot>
  </section>
</template>

<style lang="scss" scoped>
@use '@globals/tools' as t;

.transaction {
  padding: 8px 10px;
  display: grid;
  grid-template-columns:
    min-content
    max-content
    1fr
    max-content
    minmax(100px, max-content)
    max-content;
  gap: 20px;
  align-items: center;
  border: 1px solid
    color-mix(in hsl, var(t.get-color-var('border')), transparent 50%);
  border-radius: t.px-to-rem(8px);
  color: inherit;
  background-color: transparent;
}

.transaction > :last-child {
  justify-self: end;
  // border-radius: 100%;
}

.transaction__color-indicator {
  width: 6px;
  height: 100%;
  border-radius: 4px;
}

.transaction__icon {
  width: t.px-to-rem(34px);
  height: t.px-to-rem(34px);
}

.transaction__name {
  font-size: t.px-to-rem(20px);
  font-weight: 500;
}

.transaction__date {
  color: var(t.get-color-var('muted-foreground'));
}

.transaction__wallet {
  color: var(t.get-color-var('muted-foreground'));
}

.transaction__amount {
  width: max-content;
  padding: 4px 8px;
  justify-self: flex-end;
  font-size: t.px-to-rem(18px);
  font-weight: 500;
  border-radius: 6px;

  &--positive {
    background-color: var(t.get-color-var('success'));
    color: var(t.get-color-var('success-foreground'));
  }
  &--negative {
    background-color: var(t.get-color-var('danger'));
    color: var(t.get-color-var('danger-foreground'));
  }
}
</style>
