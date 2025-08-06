<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next';

import { useExchangeRates, useUserCurrencies } from '~/entities/currency';
import { useCurrentUserId } from '~/entities/user';
import CurrencyDialog from './CurrencyDialog.vue';
import CurrencyItem from './CurrencyItem.vue';
import ExchangeRateUpdater from './ExchangeRateUpdater.vue';

const baseCurrency = 'USD';

const userId = useCurrentUserId();
const currencies = useUserCurrencies(userId);
const { data: liveRates } = useExchangeRates();
</script>

<template>
  <div class="page">
    <RouterLink to="/" class="btn" data-variant="ghost">
      <ArrowLeft />
      Back
    </RouterLink>
    <h1 class="title">Settings</h1>
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
}
.stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.action-btn {
  margin-block-start: t.px-to-rem(15px);
}
</style>
