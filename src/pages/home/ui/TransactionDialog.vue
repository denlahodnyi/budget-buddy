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
import { ref, shallowRef } from 'vue';

import { createTransaction } from '~/features/transaction/create';
import { useCurrentUserId } from '~/entities/user';
import { useCurrentWalletId } from '~/entities/wallet';
import {
  useTransaction,
  type Transaction,
  DESCRIPTION_MAX_LENGTH,
  type CreatedTransactionErrors,
} from '~/entities/transaction';
import { DatePicker } from '~/shared/ui/datepicker';
import { CurrencyInput } from '~/shared/ui/currency-input';
import { FormMessage } from '~/shared/ui/form';
import { editTransaction } from '~/features/transaction/edit';

type TransactionDialogProps = {
  transactionId?: string;
};

const props = defineProps<TransactionDialogProps>();
const userId = useCurrentUserId();
const walletId = useCurrentWalletId();
const transaction = props.transactionId
  ? useTransaction(() => props.transactionId!)
  : null;

const formState = ref<{
  transactionType: Transaction['type'];
  amount: Transaction['amount'];
  createdAt: Date;
  description?: Transaction['description'];
}>({
  transactionType: transaction?.value.type ?? 'income',
  amount: transaction?.value.amount ?? 0,
  createdAt: transaction?.value.createdAt
    ? new Date(transaction.value.createdAt)
    : new Date(),
  description: transaction?.value.description ?? '',
});
const formErrors = shallowRef<CreatedTransactionErrors>({});
const currencyInputOptions = ref({ currency: 'USD' });

const saveTransaction = () => {
  const {
    transactionType: type,
    amount,
    createdAt,
    description,
  } = formState.value;
  const data = {
    amount,
    type,
    description,
    createdAt: createdAt.toISOString(),
    userId: userId.value,
    walletId: walletId.value,
  };

  const result = props.transactionId
    ? editTransaction(props.transactionId, data)
    : createTransaction(data);

  if (result.success) {
    formErrors.value = {};
    if (!transaction) {
      formState.value.transactionType = 'income';
      formState.value.amount = 0;
      formState.value.description = '';
    }
  } else if (result.errors) {
    formErrors.value = result.errors;
  }
};

const handleDialogOpenChange = (open: boolean) => {
  if (open && !transaction) {
    formState.value.createdAt = new Date();
  }
};
</script>

<template>
  <DialogRoot class="dialog" @update:open="handleDialogOpenChange">
    <DialogTrigger as-child>
      <slot></slot>
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="dialog__overlay" />
      <DialogContent class="dialog__content" aria-describedby="">
        <div class="dialog__header">
          <DialogTitle class="dialog__title">Add new transaction</DialogTitle>
          <DialogClose
            class="dialog__close btn"
            data-variant="ghost"
            data-size="icon"
            aria-label="Close dialog"
          >
            <XIcon />
          </DialogClose>
        </div>

        <form class="form" @submit.prevent="saveTransaction">
          <div class="form-item">
            <Label for="transaction-type" class="label">Transaction type</Label>

            <SelectRoot
              v-model="formState.transactionType"
              name="transactionType"
              class="select"
            >
              <SelectTrigger
                id="transaction-type"
                aria-describedby="transaction-type-error"
                class="select__trigger"
              >
                <SelectValue placeholder="Some" />
                <SelectIcon class="select__icon">
                  <ChevronDownIcon />
                </SelectIcon>
              </SelectTrigger>
              <FormMessage
                v-if="formErrors.type"
                id="transaction-type-error"
                variant="error"
              >
                {{ formErrors.type }}
              </FormMessage>

              <SelectPortal>
                <SelectContent class="select__content" position="popper">
                  <SelectViewport class="select__viewport">
                    <SelectItem value="income" class="select__item">
                      <SelectItemText>Income</SelectItemText>
                      <SelectItemIndicator class="select__item-indicator">
                        <CheckIcon :size="16" />
                      </SelectItemIndicator>
                    </SelectItem>
                    <SelectItem value="expense" class="select__item">
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
            <CurrencyInput
              id="amount"
              v-model="formState.amount"
              name="amount"
              :options="currencyInputOptions"
              aria-describedby="amount-error"
            />
            <FormMessage
              v-if="formErrors.amount"
              id="amount-error"
              variant="error"
            >
              {{ formErrors.amount }}
            </FormMessage>
          </div>

          <div class="form-item">
            <Label for="transaction-date" class="label">Date</Label>
            <DatePicker
              v-model="formState.createdAt"
              input-id="transaction-date"
              name="createdAt"
              aria-describedby="transaction-date-error"
            />
            <FormMessage
              v-if="formErrors.createdAt"
              id="transaction-date-error"
              variant="error"
            >
              {{ formErrors.amount }}
            </FormMessage>
          </div>

          <div class="form-item">
            <Label for="description" class="label">Description</Label>
            <textarea
              id="description"
              v-model="formState.description"
              name="description"
              rows="5"
              class="textarea"
              :maxlength="DESCRIPTION_MAX_LENGTH"
              aria-describedby="description-helper description-error"
            ></textarea>
            <FormMessage id="description-helper" variant="helper">
              Total characters: {{ formState.description?.length ?? 0 }}/{{
                DESCRIPTION_MAX_LENGTH
              }}
            </FormMessage>
            <FormMessage
              v-if="formErrors.description"
              id="description-error"
              variant="error"
            >
              {{ formErrors.description }}
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

<style lang="scss" scoped>
:where(.form > :not(:first-child)) {
  margin-block-start: 12px;
}

.form__footer {
  margin-block-start: 20px;
  display: flex;
  gap: 20px;
}
</style>
