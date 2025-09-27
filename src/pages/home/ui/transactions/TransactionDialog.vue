<script setup lang="ts">
import { relativePosition } from '@primeuix/utils/dom';
import {
  CheckIcon,
  ChevronDownIcon,
  SettingsIcon,
  XIcon,
} from 'lucide-vue-next';
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
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from 'radix-vue';
import { computed, defineAsyncComponent, ref, shallowRef } from 'vue';

import { CategorySelect } from '~/entities/category';
import {
  DESCRIPTION_MAX_LENGTH,
  useTransaction,
  type BaseTransaction,
  type CreatedTransaction,
  type CreatedTransactionErrors,
} from '~/entities/transaction';
import { useCurrentUserId } from '~/entities/user';
import { useUserWallets } from '~/entities/wallet';
import { createTransaction } from '~/features/transaction/create';
import { editTransaction } from '~/features/transaction/edit';
import {
  CurrencyInput,
  type CurrencyInputProps,
} from '~/shared/ui/currency-input';
import { FormMessage } from '~/shared/ui/form';

const CategoriesDialog = defineAsyncComponent(
  () => import('../categories/CategoriesDialog.vue')
);
const DatePicker = defineAsyncComponent(
  () => import('~/shared/ui/datepicker/Datepicker.vue')
);

type TransactionDialogProps = {
  transactionId?: string;
};

const props = defineProps<TransactionDialogProps>();

const userId = useCurrentUserId();
const userWallets = useUserWallets(userId);

const transaction = props.transactionId
  ? useTransaction(() => props.transactionId!)
  : null;

const formState = ref<{
  transactionType: BaseTransaction['type'];
  categoryId: BaseTransaction['categoryId'];
  walletId: BaseTransaction['walletId'];
  amount: BaseTransaction['amount'];
  createdAt: Date;
  description?: BaseTransaction['description'];
}>({
  transactionType: transaction?.value.type ?? 'income',
  categoryId: transaction?.value.categoryId ?? '',
  amount: transaction?.value.amount ?? 0,
  walletId: transaction?.value.walletId ?? '',
  createdAt: transaction?.value.createdAt
    ? new Date(transaction.value.createdAt)
    : new Date(),
  description: transaction?.value.description ?? '',
});
const formErrors = shallowRef<CreatedTransactionErrors>({});

const currencyInputOptions = computed<CurrencyInputProps['options']>(() => {
  const selectedWallet = userWallets.value.find(
    (w) => w.id === formState.value.walletId
  );
  if (
    selectedWallet?.currency?.type === 'crypto' ||
    selectedWallet?.currency?.type === 'custom'
  ) {
    const { code, decimalPlaces } = selectedWallet.currency;
    return {
      currency: code,
      precision: {
        min: decimalPlaces,
        max: decimalPlaces,
      },
      currencyDisplay: 'hidden',
    };
  } else if (selectedWallet?.currency) {
    return { currency: selectedWallet.currency.code };
  }
  return { currency: 'USD' };
});

const saveTransaction = () => {
  const {
    transactionType: type,
    amount,
    createdAt,
    description,
    categoryId,
    walletId,
  } = formState.value;
  const data: CreatedTransaction = {
    type,
    categoryId,
    amount,
    description,
    walletId,
    createdAt: createdAt.getTime(),
    userId: userId.value,
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
      formState.value.categoryId = '';
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

let pickerPanelObserver: ResizeObserver;
const handleDatepickerShow = () => {
  const picker = document.getElementById('transactionDatePicker');
  const pickerPanel = document.getElementById('transactionDatePicker_panel');
  const pickerRoot = document.getElementById('datepicker-root');
  const dialog = document.getElementById('transaction-dialog');
  if (picker && pickerPanel && pickerRoot && dialog) {
    const pickerRect = picker.getBoundingClientRect();
    const dialogRect = dialog.getBoundingClientRect();
    if (pickerRoot.parentElement) {
      // Move calendar container to the picker input
      pickerRoot.parentElement.style.top = `${
        pickerRect.top - dialogRect.top
      }px`;
      pickerRoot.parentElement.style.height = picker.style.height;
    }
    // Recalculate calendar position
    relativePosition(pickerPanel, pickerRoot);
    // Prevent calendar to be as wide as container
    pickerPanel.style.minWidth = '0';

    pickerPanelObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target.id === 'transactionDatePicker_panel') {
          // When user change calendar view, it will change its position. We
          // need to recalculate it again. Unfortunately there is no way ti
          // listen for the view change
          relativePosition(pickerPanel, pickerRoot);
          pickerPanel.style.minWidth = '0';
        }
      }
    });

    pickerPanelObserver.observe(pickerPanel);
  }
};
</script>

<template>
  <DialogRoot
    class="dialog transaction-dialog"
    @update:open="handleDialogOpenChange"
  >
    <DialogTrigger as-child>
      <slot></slot>
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="dialog__overlay" />
      <DialogContent
        id="transaction-dialog"
        class="dialog__content transaction-dialog__content"
        aria-describedby=""
      >
        <div class="dialog__header transaction-dialog__header">
          <DialogTitle class="dialog__title">
            {{
              props.transactionId ? 'Edit transaction' : 'Add new transaction'
            }}
          </DialogTitle>
          <DialogClose
            class="dialog__close btn"
            data-variant="ghost"
            data-size="icon"
            aria-label="Close dialog"
          >
            <XIcon />
          </DialogClose>
        </div>

        <div class="datepicker-container">
          <!-- Render out of scrollable area, so that picker won't be cropped -->
          <div id="datepicker-root" class="datepicker-container__root" />
        </div>

        <form
          class="form transaction-dialog__form"
          @submit.prevent="saveTransaction"
        >
          <div class="transaction-dialog__form-content">
            <div class="form-item">
              <Label for="transaction-type" class="label"
                >Transaction type</Label
              >

              <SelectRoot
                v-model="formState.transactionType"
                name="transactionType"
                class="select"
                @update:model-value="() => (formState.categoryId = '')"
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
              <Label for="transaction-category-select" class="label"
                >Category</Label
              >
              <div
                style="
                  width: 100%;
                  display: flex;
                  gap: 10px;
                  align-items: center;
                "
              >
                <CategorySelect
                  v-model="formState.categoryId"
                  :input-props="{
                    id: 'transaction-category-select',
                    'aria-describedby': 'transaction-category-error',
                  }"
                  :category-type="formState.transactionType"
                  :user-id="userId"
                  :show-no-parent-option="false"
                  :only-parents="false"
                />
                <CategoriesDialog>
                  <button
                    class="btn"
                    data-variant="ghost"
                    data-size="icon"
                    aria-label="Manage categories"
                  >
                    <SettingsIcon :size="16" />
                  </button>
                </CategoriesDialog>
              </div>
              <FormMessage
                v-if="formErrors.categoryId"
                id="transaction-category-error"
                variant="error"
              >
                {{ formErrors.categoryId }}
              </FormMessage>
            </div>

            <div class="form-item">
              <Label for="transaction-wallet" class="label">Wallet</Label>

              <SelectRoot
                v-model="formState.walletId"
                name="transactionWalletId"
                class="select"
              >
                <SelectTrigger
                  id="transaction-wallet"
                  aria-describedby="transaction-wallet-error"
                  class="select__trigger"
                >
                  <SelectValue placeholder="" />
                  <SelectIcon class="select__icon">
                    <ChevronDownIcon />
                  </SelectIcon>
                </SelectTrigger>
                <FormMessage
                  v-if="formErrors.walletId"
                  id="transaction-wallet-error"
                  variant="error"
                >
                  {{ formErrors.walletId }}
                </FormMessage>

                <SelectPortal>
                  <SelectContent class="select__content" position="popper">
                    <SelectViewport class="select__viewport">
                      <SelectItem
                        v-for="wallet of userWallets"
                        :key="wallet.id"
                        :value="wallet.id"
                        class="select__item"
                      >
                        <SelectItemText>{{ wallet.name }}</SelectItemText>
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
                id="transactionDatePicker"
                v-model="formState.createdAt"
                append-to="#datepicker-root"
                input-id="transaction-date"
                name="createdAt"
                aria-describedby="transaction-date-error"
                @show="handleDatepickerShow"
                @hide="pickerPanelObserver.disconnect()"
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
          </div>

          <div class="form__footer transaction-dialog__form-footer">
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
@use '@globals/tools' as t;
$dialog-padding: 25px;

.form__footer {
  margin-block-start: 20px;
  display: flex;
  gap: 20px;
}

.transaction-dialog__content {
  padding-inline: 0;
  display: grid;
  grid-template: 1fr / 1fr;
}
.transaction-dialog__header {
  padding-inline: $dialog-padding;
}
.transaction-dialog__form {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.transaction-dialog__form-footer {
  padding-inline: $dialog-padding;
}
.transaction-dialog__form-content {
  overflow-y: auto;
  padding-inline: $dialog-padding;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.datepicker-container {
  --modal-z: var(t.get-z-var('modal'));
  position: fixed;
  margin: 0;
  z-index: calc(var(t.get-z-var('modal')) + 10);
  padding-inline: $dialog-padding;
}
.datepicker-container__root {
  width: 0;
  height: 0;
  position: relative;
}
</style>
