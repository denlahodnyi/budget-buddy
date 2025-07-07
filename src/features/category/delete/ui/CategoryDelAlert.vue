<script setup lang="ts">
import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
} from 'radix-vue';
import { computed, ref, shallowRef, toRef } from 'vue';

import {
  CategorySelect,
  useCategoriesIds,
  useCategory,
} from '~/entities/category';
import { useCurrentUserId } from '~/entities/user';
import { deleteCategory as delCategoryGenerator } from '../model';

export interface CategoryDelAlertProps {
  categoryId: string;
}

const { categoryId } = defineProps<CategoryDelAlertProps>();

const userId = useCurrentUserId();
const category = useCategory(toRef(() => categoryId));
const delFlowGenerator = shallowRef(delCategoryGenerator(categoryId));
const shouldReassignCategory = ref(false);
const transactionsCount = ref(0);
const newCategoryId = ref('');

const shouldCreateNewCategory = computed(() => {
  const categoryType = category.value?.type;
  if (shouldReassignCategory.value && categoryType) {
    const { ids } = useCategoriesIds(
      userId,
      () => categoryType,
      () => false
    );
    return ids.value.filter((id) => id !== categoryId).length === 0;
  }
  return false;
});

const handleConfirm = () => {
  if (shouldReassignCategory.value) {
    if (!newCategoryId.value) return;
    delFlowGenerator.value.next(newCategoryId.value);
  } else {
    delFlowGenerator.value = delCategoryGenerator(categoryId);
    const { value } = delFlowGenerator.value.next();
    if (!value.success && value.isNewCategoryRequired) {
      shouldReassignCategory.value = true;
      transactionsCount.value = value.transactionsCount;
    }
  }
};

const handleAlertOpenChange = (open: boolean) => {
  if (!open) {
    delFlowGenerator.value = delCategoryGenerator(categoryId);
  }
};
</script>

<template>
  <AlertDialogRoot @update:open="handleAlertOpenChange">
    <AlertDialogTrigger as-child>
      <slot></slot>
    </AlertDialogTrigger>
    <AlertDialogPortal>
      <AlertDialogOverlay class="dialog__overlay" />
      <AlertDialogContent class="dialog__content">
        <AlertDialogTitle class="dialog__title">
          Are you absolutely sure?
        </AlertDialogTitle>
        <AlertDialogDescription
          class="dialog__description"
          aria-live="assertive"
        >
          {{
            shouldReassignCategory
              ? `${transactionsCount} transactions are using this category. Please assign a new category before continuing.`
              : 'This action cannot be undone. This will permanently delete your category.'
          }}
        </AlertDialogDescription>
        <div v-if="shouldReassignCategory && shouldCreateNewCategory">
          <p>
            You don't have available categories. <b>Please, create one first</b>
          </p>
        </div>
        <div v-else-if="shouldReassignCategory">
          <CategorySelect
            v-model="newCategoryId"
            :user-id="userId"
            :category-type="category?.type!"
            :only-parents="false"
            :show-no-parent-option="false"
            :excluded-categories="[categoryId]"
          />
        </div>
        <div
          :style="{ display: 'flex', gap: '25px', justifyContent: 'flex-end' }"
        >
          <AlertDialogCancel class="btn" data-variant="outline">
            Cancel
          </AlertDialogCancel>
          <button
            v-if="!shouldCreateNewCategory"
            class="btn"
            data-variant="destructive"
            :disabled="shouldReassignCategory && !newCategoryId"
            @click="handleConfirm"
          >
            {{
              shouldReassignCategory
                ? 'Reassign and delete'
                : 'Yes, delete category'
            }}
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>
