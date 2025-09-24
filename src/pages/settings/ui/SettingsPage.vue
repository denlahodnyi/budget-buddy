<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next';
import { toRef } from 'vue';

import { useExchangeRates, useUserCurrencies } from '~/entities/currency';
import { useCurrentUser, useCurrentUserId } from '~/entities/user';
import { UserForm, useUserForm } from '~/features/user/create-and-edit';
import { UserDelAlert } from '~/features/user/delete';
import CurrencyDialog from './CurrencyDialog.vue';
import CurrencyItem from './CurrencyItem.vue';
import ExchangeRateUpdater from './ExchangeRateUpdater.vue';

const baseCurrency = 'USD';

const userId = useCurrentUserId();
const currentUser = useCurrentUser();
const currencies = useUserCurrencies(userId);
const { data: liveRates } = useExchangeRates();
const { formState, formErrors, isDirty, submit } = useUserForm({
  isEdit: true,
  userId,
  defaultValues: toRef(() => ({ name: currentUser.value.name })),
});
</script>

<template>
  <div class="page">
    <RouterLink to="/" class="btn" data-variant="ghost">
      <ArrowLeft aria-hidden />
      Back to dashboard
    </RouterLink>
    <h1 class="title">Settings</h1>
    <h2 class="sub-title">Profile</h2>
    <div class="user-section">
      <UserForm
        v-model:name="formState.name"
        :form-errors="formErrors"
        @submit.prevent="submit"
      >
        <template #actions>
          <button
            type="submit"
            class="btn user-section__submit-btn"
            :disabled="!isDirty"
          >
            Update user details
          </button>
        </template>
      </UserForm>
      <UserDelAlert :user-id="userId">
        <button class="btn user-section__del-btn" data-variant="destructive">
          Delete user
        </button>
      </UserDelAlert>
    </div>
    <h2 class="sub-title">Currencies</h2>
    <div class="stack">
      <div>
        <ExchangeRateUpdater />
      </div>
      <template v-for="(c, id) in currencies">
        <CurrencyItem
          v-if="c"
          :key="id"
          :currency-id="id"
          :item="c"
          :rate="
            c.code === baseCurrency ? 1 : liveRates && liveRates[`USD${c.code}`]
          "
          :base-currency-code="baseCurrency"
          :heading-level="3"
          :data-testid="`currency-${c.code}`"
        />
      </template>
    </div>
    <CurrencyDialog>
      <button class="btn action-btn" data-variant="outline">
        Add currency
      </button>
    </CurrencyDialog>
  </div>
</template>

<style lang="scss" scoped>
@use '@globals/tools' as t;

.page {
  padding-block: 30px 40px;
}
.title {
  margin-block-end: t.px-to-rem(20px);
}
.sub-title {
  margin-block-end: t.px-to-rem(15px);
  &:not(:first-of-type) {
    margin-block-start: t.px-to-rem(30px);
  }
}
.stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.action-btn {
  margin-block-start: t.px-to-rem(15px);
}
.user-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-inline-size: 300px;
}
.user-section__submit-btn {
  inline-size: 100%;
}
.user-section__del-btn {
  margin-block-start: 20px;
}
</style>
