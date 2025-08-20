<script setup lang="ts">
import { XIcon } from 'lucide-vue-next';
import {
  Label,
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
} from 'radix-vue';
import { ref } from 'vue';

import type { TransactionsFilters } from '~/entities/transaction';
import { DatePicker } from '~/shared/ui/datepicker';
import { Checkbox } from '~/shared/ui/form';

export interface TransactionsFilterPopoverProps {
  filters?: Required<TransactionsFilters>;
  onSave?: (
    filters: NonNullable<TransactionsFilterPopoverProps['filters']>,
    count: number
  ) => void;
  onReset?: (
    filters: NonNullable<TransactionsFilterPopoverProps['filters']>
  ) => void;
}

const props = defineProps<TransactionsFilterPopoverProps>();

interface FiltersState {
  income: boolean;
  expense: boolean;
  dates: [Date, Date] | [];
}

const initState: FiltersState = {
  income: props.filters?.types.income ?? false,
  expense: props.filters?.types.expense ?? false,
  dates: props.filters?.dates
    ? [new Date(props.filters.dates.from), new Date(props.filters.dates.to)]
    : [],
};

const filtersState = ref<FiltersState>({
  income: initState.income,
  expense: initState.expense,
  dates: initState.dates,
});

const handleSave = () => {
  const { income, expense, dates } = filtersState.value;
  let filtersCount = 0;

  if (!income || !expense) filtersCount++;
  if (dates.length === 2) filtersCount++;

  props.onSave?.(
    {
      types: { income, expense },
      dates:
        dates[0] && dates[1]
          ? { from: dates[0].getTime(), to: dates[1].getTime() }
          : null,
    },
    filtersCount
  );
};

const handleReset = () => {
  filtersState.value.income = initState.income;
  filtersState.value.expense = initState.expense;
  filtersState.value.dates = [];

  props.onReset?.({
    types: {
      income: initState.income,
      expense: initState.expense,
    },
    dates: null,
  });
};

const handleSetDatePeriod = (period: '1w' | '1m' | '6m') => {
  const today = new Date();
  let from: Date;
  switch (period) {
    case '1w':
      from = new Date(today);
      from.setDate(today.getDate() - 7);
      break;
    case '1m':
      from = new Date(today);
      from.setMonth(today.getMonth() - 1);
      break;
    case '6m':
      from = new Date(today);
      from.setMonth(today.getMonth() - 6);
      break;
    default:
      return;
  }
  filtersState.value.dates = [from, today];
};
</script>

<template>
  <PopoverRoot class="popover filters">
    <PopoverTrigger as-child>
      <slot />
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent
        side="bottom"
        :side-offset="5"
        class="popover__content filters__content"
      >
        <PopoverClose
          class="btn popover__close"
          data-variant="ghost"
          data-size="icon"
          aria-label="Close filter"
        >
          <XIcon :size="18" />
        </PopoverClose>
        <div class="form">
          <fieldset class="filter-group">
            <legend class="filter-group__legend">Type</legend>
            <div
              class="form-item filter-group__form-item filter-group__checkbox-controller"
            >
              <Checkbox
                id="income-filter"
                v-model="filtersState.income"
                class="filter-group__checkbox"
              />
              <Label for="income-filter" class="label">Income</Label>
            </div>
            <div
              class="form-item filter-group__form-item filter-group__checkbox-controller"
            >
              <Checkbox
                id="expense-filter"
                v-model="filtersState.expense"
                class="filter-group__checkbox"
              />
              <Label for="expense-filter" class="label">Expense</Label>
            </div>
          </fieldset>
          <fieldset class="filter-group">
            <legend class="filter-group__legend">Timeframe</legend>
            <div class="form-item filter-group__form-item">
              <Label for="date-filter" class="label">Dates range</Label>
              <DatePicker
                v-model="filtersState.dates"
                input-id="date-filter"
                placeholder="Select dates"
                selection-mode="range"
                class="filter-group__datepicker"
                :manual-input="false"
                :show-icon="false"
                :show-time="false"
              />
            </div>
            <div class="filter-group__dates-controllers">
              <button
                class="btn"
                data-variant="outline"
                @click="handleSetDatePeriod('1w')"
              >
                Week
              </button>
              <button
                class="btn"
                data-variant="outline"
                @click="handleSetDatePeriod('1m')"
              >
                Month
              </button>
              <button
                class="btn"
                data-variant="outline"
                @click="handleSetDatePeriod('6m')"
              >
                6 months
              </button>
            </div>
          </fieldset>
          <div class="form__footer">
            <button class="btn" @click="handleSave">Apply filters</button>
            <button class="btn" data-variant="outline" @click="handleReset">
              Reset all
            </button>
          </div>
        </div>
        <PopoverArrow class="popover__arrow" />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

<style lang="scss" scoped>
@use '@globals/tools' as t;

:deep(.filters__content) {
  inline-size: 250px;
  padding: 12px;
}

.filter-group {
  display: block;
}

.filter-group > :not(:first-child) {
  margin-block-start: 10px;
}

.filter-group__legend {
  font-size: t.px-to-rem(16px);
  color: var(t.get-color-var('muted-foreground'));
}

.filter-group__form-item {
  font-size: t.px-to-rem(15px);
}

.filter-group__checkbox-controller {
  display: flex;
  align-items: center;
  gap: 10px;
}

:deep(.filter-group__checkbox) {
  inline-size: 20px;
  block-size: 20px;
}

.filter-group__dates-controllers {
  display: flex;
  gap: 10px;
  flex-direction: column;
  & > * {
    flex: 1;
  }
}

.filter-group__datepicker :deep(input) {
  text-align: center;
}
</style>
