<script setup lang="ts">
import { PenIcon, TrashIcon } from 'lucide-vue-next';
import { Label } from 'radix-vue';
import { ref } from 'vue';

import type { CurrencyWithUserRate } from '~/entities/currency';
import { useCurrentUserId } from '~/entities/user';
import { CurrencyDelAlert } from '~/features/currency/delete';
import { setExchangeRate } from '~/features/set-exchange-rate';
import CurrencyDialog from './CurrencyDialog.vue';

export interface CurrencyItemProps {
  currencyId: string;
  item: CurrencyWithUserRate;
  rate?: number;
  baseCurrencyCode?: string;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

const defaultBaseCurrency = 'USD';

const props = defineProps<CurrencyItemProps>();

const userId = useCurrentUserId();
const customRate = ref(props.item.userRate);
const isRateFormVisible = ref(!!props.item.userRate);
const isCustom = !!props.item.userId;

const saveCustomRate = () => {
  setExchangeRate(userId.value, props.item.code, customRate.value || 0);
  if (!customRate.value) isRateFormVisible.value = false;
};
</script>

<template>
  <div class="currency-item card">
    <div class="currency-item__header">
      <component
        :is="`h${props.headingLevel || 2}`"
        class="currency-item__title"
      >
        {{ props.item.name }} ({{ props.item.code }})
      </component>
      <div v-if="isCustom" class="currency-item__header-actions">
        <CurrencyDialog :currency-id="props.currencyId">
          <button class="btn" data-variant="ghost" data-size="icon">
            <PenIcon :size="16" />
          </button>
        </CurrencyDialog>
        <CurrencyDelAlert :currency-id="props.currencyId">
          <button class="btn" data-variant="ghost" data-size="icon">
            <TrashIcon :size="16" />
          </button>
        </CurrencyDelAlert>
      </div>
    </div>
    <p
      v-if="props.rate && props.item.code !== defaultBaseCurrency"
      class="currency-item__rate"
    >
      Current rate:
      {{ props.baseCurrencyCode && `1 ${props.baseCurrencyCode} = `
      }}{{ props.rate }} {{ props.item.code }}
    </p>
    <button
      v-if="!isRateFormVisible"
      class="currency-item__rate-form-toggle"
      @click="isRateFormVisible = true"
    >
      Set custom exchange rate
    </button>
    <form v-else>
      <div class="form-item">
        <Label :for="`rate-input__${props.currencyId}`" class="label">
          My exchange rate
        </Label>
        <input
          :id="`rate-input__${props.currencyId}`"
          v-model="customRate"
          type="number"
          min="0"
          class="input currency-item__rate-input"
          @blur="saveCustomRate"
        />
      </div>
    </form>
  </div>
</template>

<style lang="scss" scoped>
@use '@globals/tools' as t;

.currency-item__header {
  margin-block-end: 10px;
  display: flex;
  gap: 20px;
  align-items: center;
}

.currency-item__header-actions {
  display: flex;
  align-items: center;
  gap: 5px;
}

.currency-item__rate {
  margin-block-end: t.px-to-rem(10px);
  color: var(t.get-color-var('muted-foreground'));
}

.currency-item__rate-form-toggle {
  padding: 0;
  color: var(t.get-color-var('accent'));
}

.currency-item__rate-input {
  max-width: t.px-to-rem(300px);
}
</style>
