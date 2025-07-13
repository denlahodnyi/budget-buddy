<script setup lang="ts">
import { XIcon } from 'lucide-vue-next';
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  Label,
} from 'radix-vue';
import { ref } from 'vue';

import { useCurrentUserId } from '~/entities/user';
import { useWallet, type CreatedWalletErrors } from '~/entities/wallet';
import { createWallet } from '~/features/wallet/create';
import { editWallet } from '~/features/wallet/edit';
import { FormMessage } from '~/shared/ui/form';

export interface WalletDialogProps {
  walletId?: string;
}

const { walletId = '' } = defineProps<WalletDialogProps>();

const userId = useCurrentUserId();
const wallet = walletId ? useWallet(walletId) : null;
const formState = ref<{ name: string }>({
  name: wallet?.value.name ?? '',
});
const formErrors = ref<CreatedWalletErrors>({});
const isOpen = ref(false);

const saveWallet = () => {
  const { name } = formState.value;
  const payload = {
    name,
    createdAt: new Date().toISOString(),
    userId: userId.value,
  };

  const result = wallet ? editWallet(walletId, payload) : createWallet(payload);

  if (result.errors) {
    formErrors.value = result.errors;
  } else {
    formErrors.value = {};
    formState.value = { name: '' };
    isOpen.value = false;
  }
};

const handleDialogOpenChange = (open: boolean) => {
  isOpen.value = open;
  if (!open) {
    formErrors.value = {};
    formState.value = { name: '' };
  }
};
</script>

<template>
  <DialogRoot
    class="dialog"
    :open="isOpen"
    @update:open="handleDialogOpenChange"
  >
    <DialogTrigger as-child>
      <slot />
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="dialog__overlay" />
      <DialogContent class="dialog__content" aria-describedby="">
        <div class="dialog__header">
          <DialogTitle class="dialog__title">{{
            walletId ? 'Edit wallet' : 'Create new wallet'
          }}</DialogTitle>
          <DialogClose
            class="dialog__close btn"
            data-variant="ghost"
            data-size="icon"
          >
            <XIcon :size="16" />
          </DialogClose>
        </div>

        <form class="form" @submit.prevent="saveWallet">
          <div class="form-item">
            <Label for="wallet-name">Name</Label>
            <input
              id="wallet-name"
              v-model="formState.name"
              type="text"
              class="input"
              aria-describedby="wallet-name-error"
            />
            <FormMessage
              v-if="formErrors.name"
              id="wallet-name-error"
              variant="error"
            >
              {{ formErrors.name }}
            </FormMessage>
          </div>

          <div class="form__footer">
            <button type="submit" class="btn">Save</button>
            <DialogClose as-child>
              <button class="btn" data-variant="outline">Cancel</button>
            </DialogClose>
          </div>
        </form>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
