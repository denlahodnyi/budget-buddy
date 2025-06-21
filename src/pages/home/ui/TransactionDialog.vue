<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  Label,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
  SelectIcon,
} from 'radix-vue';
import { XIcon, ChevronDownIcon, CheckIcon } from 'lucide-vue-next';
import { ref } from 'vue';

import { useCreateTransaction } from '~/features/transaction/create';
import { useCurrentUserId } from '~/entities/user';
import { useCurrentWalletId } from '~/entities/wallet';
import type { Transaction } from '~/entities/transaction';

const userId = useCurrentUserId();
const walletId = useCurrentWalletId();
const createTransaction = useCreateTransaction();

const formState = ref<{
  transactionType: Transaction['type'];
  amount: number;
}>({
  transactionType: 'income',
  amount: 0,
});

const saveTransaction = (e: Event) => {
  e.preventDefault();
  const { transactionType: type, amount } = formState.value;
  createTransaction({
    amount,
    type,
    userId: userId.value,
    walletId: walletId.value,
    createdAt: new Date().toISOString(),
  });
};
</script>

<template>
  <DialogRoot class="dialog">
    <DialogTrigger as-child>
      <slot></slot>
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="dialog__overlay" />
      <DialogContent class="dialog__content">
        <div class="dialog__header">
          <DialogTitle class="dialog__title">Add new transaction</DialogTitle>
          <DialogClose
            class="dialog__close btn"
            data-variant="ghost"
            data-size="icon"
          >
            <XIcon />
          </DialogClose>
        </div>

        <form class="form" @submit="saveTransaction">
          <div class="form-item">
            <Label for="transaction-type" class="label">Transaction type</Label>

            <SelectRoot
              v-model="formState.transactionType"
              class="select"
              name="transactionType"
            >
              <SelectTrigger id="transaction-type" class="select__trigger">
                <SelectValue placeholder="Some" />
                <SelectIcon class="select__icon">
                  <ChevronDownIcon />
                </SelectIcon>
              </SelectTrigger>

              <SelectPortal>
                <SelectContent class="select__content" position="popper">
                  <SelectViewport class="select__viewport">
                    <SelectItem :value="'income'" class="select__item">
                      <SelectItemText>Income</SelectItemText>
                      <SelectItemIndicator class="select__item-indicator">
                        <CheckIcon :size="16" />
                      </SelectItemIndicator>
                    </SelectItem>
                    <SelectItem :value="'expense'" class="select__item">
                      <SelectItemText>Expense</SelectItemText>
                      <SelectItemIndicator class="select__item-indicator">
                        <CheckIcon :size="16" />
                      </SelectItemIndicator>
                    </SelectItem>
                  </SelectViewport>
                </SelectContent>
              </SelectPortal>
            </SelectRoot>
          </div>

          <div class="form-item">
            <Label for="amount" class="label">Amount</Label>
            <input
              id="amount"
              v-model="formState.amount"
              type="number"
              class="input"
            />
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

<style lang="scss" scoped>
:where(.form > :not(:last-child)) {
  margin-block-end: 12px;
}
.form__footer {
  display: flex;
  gap: 20px;
}
</style>
