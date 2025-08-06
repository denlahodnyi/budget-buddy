<script setup lang="ts">
import { CheckIcon, ChevronDownIcon, XIcon } from 'lucide-vue-next';
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
import { ref, shallowRef, toRef, useTemplateRef } from 'vue';

import {
  useCurrency,
  type BaseCurrency,
  type CreatedCurrency,
  type CreatedCurrencyErrors,
} from '~/entities/currency';
import { useCurrentUserId } from '~/entities/user';
import { createCurrency } from '~/features/currency/create';
import { editCurrency } from '~/features/currency/edit';
import { FormMessage } from '~/shared/ui/form';
export interface CurrencyDialogProps {
  currencyId?: string;
}

const props = defineProps<CurrencyDialogProps>();

const getDefaultForm = () => {
  return {
    name: currency?.value.name ?? '',
    code: currency?.value.code ?? '',
    type: currency?.value.type ?? 'fiat',
    decimalPlaces: currency?.value.decimalPlaces ?? 2,
  };
};

const userId = useCurrentUserId();
const currency = props.currencyId
  ? useCurrency(toRef(() => props.currencyId!))
  : null;
const formState = ref<{
  name: BaseCurrency['name'];
  code: BaseCurrency['code'];
  type: BaseCurrency['type'];
  decimalPlaces: BaseCurrency['decimalPlaces'];
}>(getDefaultForm());
const formErrors = shallowRef<CreatedCurrencyErrors>({});
const isOpen = ref(false);
const dialogRef = useTemplateRef('dialog');

const saveCurrency = () => {
  const payload: CreatedCurrency = {
    ...formState.value,
    userId: userId.value,
    isISO: formState.value.type === 'fiat',
    decimalPlaces:
      formState.value.type === 'fiat' ? 2 : formState.value.decimalPlaces,
  };
  const result = props.currencyId
    ? editCurrency(props.currencyId, payload)
    : createCurrency(payload);

  if (result.success) {
    formState.value = getDefaultForm();
    formErrors.value = {};
    isOpen.value = false;
    dialogRef.value?.$emit('update:open', false);
  } else if (result.errors) {
    formErrors.value = result.errors;
  }
};

const handleDialogOpenChange = (open: boolean) => {
  isOpen.value = open;
  if (!open) {
    formState.value = getDefaultForm();
    formErrors.value = {};
  }
};
</script>

<template>
  <DialogRoot
    ref="dialog"
    :open="isOpen"
    class="dialog"
    @update:open="handleDialogOpenChange"
  >
    <DialogTrigger as-child>
      <slot />
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="dialog__overlay" />
      <DialogContent class="dialog__content" aria-describedby="">
        <div class="dialog__header">
          <DialogTitle class="dialog__title">
            {{ props.currencyId ? 'Edit currency' : 'Add new currency' }}
          </DialogTitle>
          <DialogClose
            class="btn dialog__close"
            data-variant="ghost"
            data-size="icon"
            aria-label="Close dialog"
          >
            <XIcon />
          </DialogClose>
        </div>

        <form class="form" @submit.prevent="saveCurrency">
          <div class="form-item">
            <Label for="currency-type" class="label">Type</Label>

            <SelectRoot
              v-model="formState.type"
              name="transactionType"
              class="select"
            >
              <SelectTrigger
                id="currency-type"
                aria-describedby="currency-type-error"
                class="select__trigger"
              >
                <SelectValue placeholder="" />
                <SelectIcon class="select__icon">
                  <ChevronDownIcon />
                </SelectIcon>
              </SelectTrigger>
              <FormMessage
                v-if="formErrors.type"
                id="currency-type-error"
                variant="error"
              >
                {{ formErrors.type }}
              </FormMessage>

              <SelectPortal>
                <SelectContent class="select__content" position="popper">
                  <SelectViewport class="select__viewport">
                    <SelectItem value="fiat" class="select__item">
                      <SelectItemText>Fiat</SelectItemText>
                      <SelectItemIndicator class="select__item-indicator">
                        <CheckIcon :size="16" />
                      </SelectItemIndicator>
                    </SelectItem>
                    <SelectItem value="crypto" class="select__item">
                      <SelectItemText>Crypto</SelectItemText>
                      <SelectItemIndicator class="select__item-indicator">
                        <CheckIcon :size="16" />
                      </SelectItemIndicator>
                    </SelectItem>
                    <SelectItem value="custom" class="select__item">
                      <SelectItemText>Custom</SelectItemText>
                      <SelectItemIndicator class="select__item-indicator">
                        <CheckIcon :size="16" />
                      </SelectItemIndicator>
                    </SelectItem>
                  </SelectViewport>
                </SelectContent>
              </SelectPortal>
            </SelectRoot>
          </div>

          <div class="form__item">
            <Label for="currency-name" class="label">Name</Label>
            <input
              id="currency-name"
              v-model.trim="formState.name"
              type="text"
              class="input"
              aria-describedby="currency-name-error"
            />
            <FormMessage
              v-if="formErrors.name"
              id="currency-name-error"
              variant="error"
            >
              {{ formErrors.name }}
            </FormMessage>
          </div>

          <div class="form__item">
            <Label for="currency-code" class="label">Code</Label>
            <input
              id="currency-code"
              v-model.trim="formState.code"
              type="text"
              class="input"
              aria-describedby="currency-code-error"
            />
            <FormMessage
              v-if="formErrors.code"
              id="currency-code-error"
              variant="error"
            >
              {{ formErrors.code }}
            </FormMessage>
          </div>

          <div v-if="formState.type !== 'fiat'" class="form__item">
            <Label for="currency-code" class="label">Decimals</Label>
            <input
              id="currency-dec"
              v-model="formState.decimalPlaces"
              type="number"
              min="0"
              step="1"
              inputmode="numeric"
              class="input"
              aria-describedby="currency-dec-error"
            />
            <FormMessage
              v-if="formErrors.decimalPlaces"
              id="currency-dec-error"
              variant="error"
            >
              {{ formErrors.decimalPlaces }}
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
