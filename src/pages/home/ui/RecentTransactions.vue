<script setup lang="ts">
import {
  ArrowDownUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  EllipsisIcon,
  FunnelIcon,
  PlusIcon,
} from 'lucide-vue-next';
import {
  PaginationEllipsis,
  PaginationFirst,
  PaginationLast,
  PaginationList,
  PaginationListItem,
  PaginationNext,
  PaginationPrev,
  PaginationRoot,
} from 'radix-vue';
import { computed, ref, shallowRef } from 'vue';

import {
  PER_PAGE,
  useTransactionsCount,
  useUserTransactionsQuery,
  type TransactionsFilters,
} from '~/entities/transaction';
import { useCurrentUserId } from '~/entities/user';
import { ResultSortedTableView } from '~/shared/lib/tiny-base';
import Transaction from './Transaction.vue';
import TransactionDialog from './TransactionDialog.vue';
import TransactionsFilterPopover, {
  type TransactionsFilterPopoverProps,
} from './TransactionsFilterPopover.vue';
import TransactionsSortDropdown, {
  type SortByValue,
} from './TransactionsSortDropdown.vue';

const userId = useCurrentUserId();
const currentPage = ref(1);
const currentOffset = computed(() => currentPage.value * PER_PAGE - PER_PAGE);
const filterBy = shallowRef<Required<TransactionsFilters>>({
  types: {
    income: true,
    expense: true,
  },
  dates: null,
});
const sortBy = ref<SortByValue>('date:desc');
const appliedFiltersCount = ref(0);
const count = useTransactionsCount(userId, filterBy);
const { queryId, queries, adaptResultRow, toTypedResultRow } =
  useUserTransactionsQuery(userId, filterBy, {
    category: true,
    currency: true,
    wallet: true,
  });

const handleChangeFilters = (
  filters: Parameters<NonNullable<TransactionsFilterPopoverProps['onSave']>>[0],
  filtersCount: number
) => {
  filterBy.value = filters;
  currentPage.value = 1;
  appliedFiltersCount.value = filtersCount;
};

const handleResetFilters = (
  filters: Parameters<NonNullable<TransactionsFilterPopoverProps['onReset']>>[0]
) => {
  filterBy.value = filters;
  currentPage.value = 1;
  appliedFiltersCount.value = 0;
};
</script>

<template>
  <section class="recent-t card">
    <div class="card__header card__header_with-actions">
      <div class="recent-t__title-wrapper">
        <h2 class="card__title">Recent Transactions</h2>
        <TransactionsFilterPopover
          :filters="filterBy"
          :on-save="handleChangeFilters"
          :on-reset="handleResetFilters"
        >
          <button
            class="btn filter-btn"
            data-variant="ghost"
            data-size="icon"
            aria-label="Show transactions filters"
          >
            <FunnelIcon :size="20" />
            <span class="filter-btn__count">{{ appliedFiltersCount }}</span>
          </button>
        </TransactionsFilterPopover>
        <TransactionsSortDropdown v-model:sort="sortBy">
          <button
            class="btn"
            data-variant="ghost"
            data-size="icon"
            aria-label="Sort transactions"
          >
            <ArrowDownUpIcon :size="20" />
          </button>
        </TransactionsSortDropdown>
      </div>
      <TransactionDialog>
        <button class="btn"><PlusIcon :size="20" />Add new</button>
      </TransactionDialog>
    </div>
    <div role="list" class="transactions-list">
      <ResultSortedTableView
        v-slot="slotProps"
        :cell-id="sortBy.includes('amount') ? 'amount' : 'createdAt'"
        :queries="queries"
        :query-id="queryId"
        :descending="sortBy.includes('desc')"
        :offset="currentOffset"
        :limit="PER_PAGE"
      >
        <Transaction
          :id="slotProps.rowId"
          :item="adaptResultRow(toTypedResultRow(slotProps.row))"
        />
      </ResultSortedTableView>
    </div>
    <PaginationRoot
      v-model:page="currentPage"
      :v-show="count > PER_PAGE"
      :total="count"
      :sibling-count="1"
      class="pagination"
    >
      <PaginationList v-slot="{ items }" class="pagination__list">
        <PaginationFirst
          class="pagination-btn btn"
          data-variant="ghost"
          data-size="icon"
        >
          <ChevronsLeftIcon />
        </PaginationFirst>
        <PaginationPrev
          class="pagination-btn btn"
          data-variant="ghost"
          data-size="icon"
        >
          <ChevronLeftIcon />
        </PaginationPrev>
        <template v-for="(page, index) in items">
          <PaginationListItem
            v-if="page.type === 'page'"
            :key="index"
            :value="page.value"
            class="pagination-btn btn"
            data-variant="ghost"
          >
            {{ page.value }}
          </PaginationListItem>
          <PaginationEllipsis v-else :key="page.type" :index="index">
            <EllipsisIcon />
          </PaginationEllipsis>
        </template>
        <PaginationNext
          class="pagination-btn btn"
          data-variant="ghost"
          data-size="icon"
        >
          <ChevronRightIcon />
        </PaginationNext>
        <PaginationLast
          class="pagination-btn btn"
          data-variant="ghost"
          data-size="icon"
        >
          <ChevronsRightIcon />
        </PaginationLast>
      </PaginationList>
    </PaginationRoot>
  </section>
</template>

<style lang="scss" scoped>
@use '@globals/tools' as t;

.transactions-list {
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recent-t__title-wrapper {
  display: flex;
  align-items: center;
  gap: 20px;
}

.pagination {
  padding-block: 20px;
  display: flex;
  justify-content: center;
}
.pagination__list {
  display: flex;
  align-items: center;
  gap: 10px;
}
.pagination-btn {
  font-size: t.px-to-rem(20px);

  &:not(:hover)[data-selected] {
    color: var(t.get-color-var('accent'));
  }
}

.filter-btn {
  position: relative;
}
.filter-btn__count {
  position: absolute;
  inset-block-start: -6px;
  inset-inline-end: -6px;
  inline-size: t.px-to-rem(20px);
  block-size: t.px-to-rem(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(t.get-color-var('accent-foreground'));
  font-size: t.px-to-rem(12px);
  background-color: var(t.get-color-var('accent'));
}
</style>
