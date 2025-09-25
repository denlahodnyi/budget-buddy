<script setup lang="ts">
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
} from 'radix-vue';
import { computed, ref } from 'vue';

import { useCurrentUserId } from '~/entities/user';
import { clearUserData } from '~/features/clear-user-data';
import { Checkbox } from '~/shared/ui/form';

interface FormState {
  transactions: boolean;
  wallets: boolean;
  categories: boolean;
  currencies: boolean;
  rates: boolean;
}

const userId = useCurrentUserId();
const formState = ref<FormState>({
  transactions: false,
  wallets: false,
  categories: false,
  currencies: false,
  rates: false,
});
const isDirty = computed(() => Object.values(formState.value).some((v) => !!v));

const handleSubmit = () => {
  clearUserData(userId.value, formState.value);
  formState.value = {
    transactions: false,
    wallets: false,
    categories: false,
    currencies: false,
    rates: false,
  };
};
</script>

<template>
  <form class="form">
    <div class="form-item">
      <Checkbox id="clear-tran" v-model="formState.transactions" />
      <label for="clear-tran">Transactions</label>
    </div>
    <div class="form-item">
      <Checkbox id="clear-wal" v-model="formState.wallets" />
      <label for="clear-wal">Wallets</label>
    </div>
    <div class="form-item">
      <Checkbox id="clear-cat" v-model="formState.categories" />
      <label for="clear-cat">Categories</label>
    </div>
    <div class="form-item">
      <Checkbox id="clear-cur" v-model="formState.currencies" />
      <label for="clear-cur">Currencies</label>
    </div>
    <div class="form-item">
      <Checkbox id="clear-rat" v-model="formState.rates" />
      <label for="clear-rat">Exchange rates</label>
    </div>

    <AlertDialogRoot>
      <AlertDialogTrigger as-child>
        <button
          type="button"
          class="btn form-submit"
          data-variant="destructive"
          :disabled="!isDirty"
        >
          Clear data
        </button>
      </AlertDialogTrigger>
      <AlertDialogPortal>
        <AlertDialogOverlay class="dialog__overlay" />
        <AlertDialogContent class="dialog__content">
          <AlertDialogTitle class="dialog__title">
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription class="dialog__description">
            This action cannot be undone. This will permanently delete your data
          </AlertDialogDescription>
          <div
            :style="{
              display: 'flex',
              gap: '25px',
              justifyContent: 'flex-end',
            }"
          >
            <AlertDialogCancel class="btn" data-variant="outline">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              type="button"
              class="btn"
              data-variant="destructive"
              @click="handleSubmit"
            >
              Yes, delete selected data
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialogRoot>
  </form>
</template>

<style lang="scss" scoped>
.form-item {
  display: flex;
  align-items: center;
  gap: 20px;
}
.form-submit {
  width: 100%;
}
</style>
