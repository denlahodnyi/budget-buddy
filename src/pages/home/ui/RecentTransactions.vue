<script setup lang="ts">
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  EllipsisIcon,
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
import { computed, ref } from 'vue';

import {
  PER_PAGE,
  useTransactionsCount,
  useUserTransactionsQuery,
} from '~/entities/transaction';
import { useCurrentUserId } from '~/entities/user';
import { ResultSortedTableView } from '~/shared/lib/tiny-base';
import Transaction from './Transaction.vue';
import TransactionDialog from './TransactionDialog.vue';

const userId = useCurrentUserId();
const currentPage = ref(1);
const currentOffset = computed(() => currentPage.value * PER_PAGE - PER_PAGE);
const count = useTransactionsCount(userId);
const { queryId, queries, adaptResultRow, toTypedResultRow } =
  useUserTransactionsQuery(userId, {
    category: true,
    currency: true,
    wallet: true,
  });
</script>

<template>
  <section class="card">
    <div class="card__header card__header_with-actions">
      <h2 class="card__title">Recent Transactions</h2>
      <TransactionDialog>
        <button class="btn"><PlusIcon :size="20" />Add new</button>
      </TransactionDialog>
    </div>
    <div role="list" class="transactions-list">
      <ResultSortedTableView
        v-slot="slotProps"
        cell-id="createdAt"
        :queries="queries"
        :query-id="queryId"
        :descending="true"
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
</style>
