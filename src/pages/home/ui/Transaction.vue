<script setup lang="ts">
import { EllipsisVerticalIcon, PencilIcon, TrashIcon } from 'lucide-vue-next';
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuItem,
  DropdownMenuContent,
} from 'radix-vue';
import { ref } from 'vue';

import { useTransaction } from '~/entities/transaction';
import TransactionDialog from './TransactionDialog.vue';

interface TransactionProps {
  id: string;
}

const props = defineProps<TransactionProps>();
const t = useTransaction(() => props.id);
const isActionsDropdownOpen = ref(false);
const isEditDialogOpen = ref(false);

function handleDialogOpenChange(open: boolean) {
  isEditDialogOpen.value = open;
  if (!open) {
    isActionsDropdownOpen.value = false;
  }
}
function handleDropdownOpenChange(open: boolean) {
  isActionsDropdownOpen.value = open;
}
</script>

<template>
  <section class="transaction">
    <p>{{ t.type }}</p>
    <p>{{ t.formattedAmount }}</p>
    <p>{{ new Date(t.createdAt).toLocaleDateString() }}</p>

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
            <DropdownMenuItem class="dropdown__item" disabled>
              <TrashIcon :size="16" />Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenuTrigger>
    </DropdownMenuRoot>
  </section>
</template>

<style lang="scss" scoped>
@use '@globals/tools' as t;

.transaction {
  padding: 6px 8px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  align-items: center;
  border: 1px solid
    color-mix(in hsl, var(t.get-color-var('border')), transparent 50%);
  border-radius: t.px-to-rem(8px);
  color: inherit;
  background-color: transparent;
}

.transaction > :last-child {
  justify-self: end;
  border-radius: 100%;
}
</style>
