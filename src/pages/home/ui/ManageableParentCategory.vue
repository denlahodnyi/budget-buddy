<script setup lang="ts">
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PenIcon,
  TrashIcon,
} from 'lucide-vue-next';
import {
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
} from 'radix-vue';
import { ref, toRef } from 'vue';

import { useCategoryByQuery, useSubcategoriesIds } from '~/entities/category';
import { CategoryDelAlert } from '~/features/category/delete';
import ManageableCategory from './ManageableCategory.vue';
import CategoryDialog from './CategoryDialog.vue';

export interface ManageableParentCategory {
  id: string;
  parentCategoriesQueryId: string;
}

const { id, parentCategoriesQueryId } = defineProps<ManageableParentCategory>();

const category = useCategoryByQuery(
  toRef(() => id),
  toRef(() => parentCategoriesQueryId)
);
const { ids: childrenIds, queryId: subCategoriesQueryId } = useSubcategoriesIds(
  toRef(() => id)
);
const isOpen = ref(true);
</script>

<template>
  <template v-if="category">
    <CollapsibleRoot
      v-if="childrenIds.length"
      v-model:open="isOpen"
      class="parent-category"
    >
      <div class="parent-category__header">
        <span>{{ category.name }}</span>
        <CategoryDialog
          :category-type="category.type"
          :category-id="id"
          :allow-parent-select="false"
        >
          <button
            class="btn"
            data-variant="ghost"
            data-size="icon"
            aria-label="Edit category"
          >
            <PenIcon :size="16" />
          </button>
        </CategoryDialog>
        <CategoryDelAlert :category-id="id">
          <button
            class="btn"
            data-variant="ghost"
            data-size="icon"
            aria-label="Delete category"
          >
            <TrashIcon :size="16" />
          </button>
        </CategoryDelAlert>
        <CollapsibleTrigger
          class="btn"
          data-variant="ghost"
          data-size="icon"
          aria-label="Collapse/Expand"
        >
          <ChevronDownIcon v-if="!isOpen" :size="16" />
          <ChevronUpIcon v-else :size="16" />
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent class="parent-category__content">
        <ManageableCategory
          v-for="childId of childrenIds"
          :id="childId"
          :key="childId"
          :query-id="subCategoriesQueryId"
          :can-change-parent="true"
          class="parent-category__child"
        />
      </CollapsibleContent>
    </CollapsibleRoot>

    <ManageableCategory
      v-else
      :id="id"
      :query-id="parentCategoriesQueryId"
      :can-change-parent="true"
    />
  </template>
</template>

<style lang="scss" scoped>
@use '@globals/tools' as t;

.parent-category {
  padding: t.px-to-rem(10px) t.px-to-rem(5px);
  border-radius: 6px;
  color: var(t.get-color-var('card-foreground'));
  background-color: var(t.get-color-var('card'));
}

.parent-category__header {
  padding-inline-start: 6px;
  display: flex;
  align-items: center;
  gap: t.px-to-rem(8px);
  & > :first-child {
    display: block;
    flex: 1;
  }
}

.parent-category__content {
  padding-inline-start: 10px;
  overflow: hidden;

  &[data-state='open'] {
    animation: slideDown 250ms ease-out;
  }
  &[data-state='closed'] {
    animation: slideUp 250ms ease-out;
  }
}

.parent-category__child {
  padding-inline-end: 0;
  border-radius: 0;
  &:not(:last-child) {
    border-bottom: 1px solid var(t.get-color-var('border'));
  }
}

@keyframes slideDown {
  from {
    height: 0;
  }
  to {
    height: var(--radix-collapsible-content-height);
  }
}

@keyframes slideUp {
  from {
    height: var(--radix-collapsible-content-height);
  }
  to {
    height: 0;
  }
}
</style>
