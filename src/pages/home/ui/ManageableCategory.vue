<script setup lang="ts">
import { PenIcon, TrashIcon } from 'lucide-vue-next';
import { toRef } from 'vue';

import { useCategoryByQuery } from '~/entities/category';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '~/store';
import { CategoryDelAlert } from '~/features/category/delete';
import CategoryDialog from './CategoryDialog.vue';

export interface CategoryButtonProps {
  id: string;
  queryId: string;
  canChangeParent: boolean;
}

const { id, queryId, canChangeParent } = defineProps<CategoryButtonProps>();
const category = useCategoryByQuery(
  toRef(() => id),
  toRef(() => queryId)
);
const iconName = category.value?.icon ? category.value.icon : 'other';
const CategoryIcon = CATEGORY_ICONS[iconName];
</script>

<template>
  <section v-if="category" class="category">
    <div
      class="category__color"
      :style="{ backgroundColor: CATEGORY_COLORS[category.color] }"
    />
    <component
      :is="CategoryIcon"
      class="category__icon"
      role="img"
      :aria-label="`Icon: ${iconName}`"
    />
    <span>{{ category!.name }}</span>
    <CategoryDialog
      :category-type="category.type"
      :category-id="id"
      :allow-parent-select="canChangeParent"
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
  </section>
</template>

<style lang="scss" scoped>
@use '@globals/tools' as t;

.category {
  padding: t.px-to-rem(10px) t.px-to-rem(5px);
  display: grid;
  grid-template-columns: repeat(2, max-content) 1fr auto auto;
  gap: t.px-to-rem(8px);
  align-items: center;
  border-radius: 6px;
  background-color: var(t.get-color-var('card'));
}

.category__color {
  width: 4px;
  height: 100%;
  border-radius: 6px;
}

.category__icon {
  width: t.px-to-rem(24px);
  height: t.px-to-rem(24px);
}
</style>
