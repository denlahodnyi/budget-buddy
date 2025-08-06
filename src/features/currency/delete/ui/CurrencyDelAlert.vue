<script setup lang="ts">
import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
} from 'radix-vue';
import { computed, ref, shallowRef } from 'vue';

import { CurrencySelect, useUserCurrencies } from '~/entities/currency';
import { useCurrentUserId } from '~/entities/user';
import { deleteCurrency as currencyDeleteGenerator } from '../model';

export interface CurrencyDelAlertProps {
  currencyId: string;
}

const { currencyId } = defineProps<CurrencyDelAlertProps>();

const userId = useCurrentUserId();
const delFlowGenerator = shallowRef(currencyDeleteGenerator(currencyId));
const shouldReassignCurrency = ref(false);
const walletsCount = ref(0);
const newCurrencyId = ref('');

const shouldCreateNewCurrency = computed(() => {
  if (shouldReassignCurrency.value) {
    const resultTable = useUserCurrencies(userId);
    return (
      Object.keys(resultTable.value).filter((id) => id !== currencyId)
        .length === 0
    );
  }
  return false;
});

const handleConfirm = () => {
  if (shouldReassignCurrency.value) {
    if (!newCurrencyId.value) return;
    delFlowGenerator.value.next(newCurrencyId.value);
  } else {
    delFlowGenerator.value = currencyDeleteGenerator(currencyId);
    const { value } = delFlowGenerator.value.next();
    if (!value.success && value.isNewCurrencyRequired) {
      shouldReassignCurrency.value = true;
      walletsCount.value = value.walletsCount;
    }
  }
};

const handleAlertOpenChange = (open: boolean) => {
  if (!open) {
    delFlowGenerator.value = currencyDeleteGenerator(currencyId);
  }
};
</script>

<template>
  <AlertDialogRoot @update:open="handleAlertOpenChange">
    <AlertDialogTrigger as-child>
      <slot></slot>
    </AlertDialogTrigger>
    <AlertDialogPortal>
      <AlertDialogOverlay class="dialog__overlay" />
      <AlertDialogContent class="dialog__content">
        <AlertDialogTitle class="dialog__title">
          Are you absolutely sure?
        </AlertDialogTitle>
        <AlertDialogDescription
          class="dialog__description"
          aria-live="assertive"
        >
          {{
            shouldReassignCurrency
              ? `${walletsCount} wallets are using this currency. Please assign a new currency before continuing.`
              : 'This action cannot be undone. This will permanently delete your currency.'
          }}
        </AlertDialogDescription>
        <div v-if="shouldReassignCurrency && shouldCreateNewCurrency">
          <p>
            You don't have available currencies. <b>Please, create one first</b>
          </p>
        </div>
        <div v-else-if="shouldReassignCurrency">
          <CurrencySelect
            v-model="newCurrencyId"
            :user-id="userId"
            :input-props="{ 'aria-label': 'New currency' }"
          />
        </div>
        <div
          :style="{ display: 'flex', gap: '25px', justifyContent: 'flex-end' }"
        >
          <AlertDialogCancel class="btn" data-variant="outline">
            Cancel
          </AlertDialogCancel>
          <button
            v-if="!shouldCreateNewCurrency"
            class="btn"
            data-variant="destructive"
            :disabled="shouldReassignCurrency && !newCurrencyId"
            @click="handleConfirm"
          >
            {{
              shouldReassignCurrency
                ? 'Reassign and delete'
                : 'Yes, delete currency'
            }}
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>
