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

import { useWallet } from '~/entities/wallet';
import { WalletDelAlert } from '~/features/wallet/delete';
import WalletDialog from './WalletDialog.vue';

export interface WalletItemProps {
  walletId: string;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

const { walletId, headingLevel = 3 } = defineProps<WalletItemProps>();

const wallet = useWallet(toRef(() => walletId));
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
  <article class="wallet-item">
    <div>
      <component :is="`h${headingLevel}`" class="wallet-item__name">
        {{ wallet.name }}
      </component>
      <p class="wallet-item__balance">{{ wallet.formattedTotalBalance }}</p>
    </div>

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
            <WalletDialog
              :wallet-id="walletId"
              @update:open="handleDialogOpenChange"
            >
              <DropdownMenuItem class="dropdown__item" @select.prevent>
                <PencilIcon :size="16" />Edit
              </DropdownMenuItem>
            </WalletDialog>
            <WalletDelAlert :wallet-id="walletId">
              <DropdownMenuItem class="dropdown__item" @select.prevent>
                <TrashIcon :size="16" />Delete
              </DropdownMenuItem>
            </WalletDelAlert>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenuTrigger>
    </DropdownMenuRoot>
  </article>
</template>

<style lang="scss" scoped>
@use '@globals/tools' as t;

.wallet-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.wallet-item__name {
  font-size: t.px-to-rem(18px);
}
</style>
