<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next';
import { toRef } from 'vue';

import { useExchangeRates, useUserCurrencies } from '~/entities/currency';
import { useCurrentUser, useCurrentUserId } from '~/entities/user';
import { UserForm, useUserForm } from '~/features/user/create-and-edit';
import { UserDelAlert } from '~/features/user/delete';
import ClearDataForm from './ClearDataForm.vue';
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
    <div class="card user-section">
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
      <div class="currencies-grid">
        <template v-for="(c, id) in currencies">
          <CurrencyItem
            v-if="c"
            :key="id"
            :currency-id="id"
            :item="c"
            :rate="
              c.code === baseCurrency
                ? 1
                : liveRates && liveRates[`USD${c.code}`]
            "
            :base-currency-code="baseCurrency"
            :heading-level="3"
            :data-testid="`currency-${c.code}`"
          />
        </template>
      </div>
    </div>
    <CurrencyDialog>
      <button class="btn action-btn" data-size="large">Add currency</button>
    </CurrencyDialog>
    <h2 class="sub-title">Clear data</h2>
    <div class="card clear-data-section">
      <p class="secondary-txt">Choose which data to remove completely</p>
      <ClearDataForm />
    </div>
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
  @include t.screen(sm) {
    max-inline-size: 300px;
  }
}
.user-section__submit-btn {
  inline-size: 100%;
}
.user-section__del-btn {
  margin-block-start: 20px;
}
.secondary-txt {
  margin-block-end: 15px;
  color: var(t.get-color-var('muted-foreground'));
}
.clear-data-section {
  @include t.screen(sm) {
    max-inline-size: 300px;
  }
}
.currencies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  @include t.screen(md) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}
</style>
