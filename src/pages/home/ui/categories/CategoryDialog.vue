<script setup lang="ts">
import { CheckIcon, XIcon } from 'lucide-vue-next';
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  Label,
  RadioGroupIndicator,
  RadioGroupItem,
  RadioGroupRoot,
} from 'radix-vue';
import { ref, toRef } from 'vue';

import {
  CATEGORY_NAME_MAX_LENGTH,
  CategorySelect,
  NO_PARENT_VAL,
  useCategory,
  type Category,
  type CreatedCategoryErrors,
} from '~/entities/category';
import { useCurrentUserId } from '~/entities/user';
import { createCategory } from '~/features/category/create';
import { editCategory } from '~/features/category/edit';
import { FormMessage } from '~/shared/ui/form';
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  DEFAULT_CAT_COLOR,
  DEFAULT_CAT_ICON,
} from '~/store';

export interface CategoryDialogProps {
  categoryType: Category['type'];
  categoryId?: string;
  allowParentSelect?: boolean;
}

const {
  categoryType,
  categoryId = null,
  allowParentSelect = false,
} = defineProps<CategoryDialogProps>();

const userId = useCurrentUserId();
const category = categoryId ? useCategory(toRef(() => categoryId)) : null;
const formState = ref<{
  name: Category['name'];
  color: Category['color'];
  icon: Category['icon'];
  parentId: Category['parentId'];
}>({
  name: category?.value?.name ?? '',
  color: category?.value?.color ?? DEFAULT_CAT_COLOR,
  icon: category?.value?.icon ?? DEFAULT_CAT_ICON,
  parentId: category?.value?.parentId ?? NO_PARENT_VAL,
});
const formErrors = ref<CreatedCategoryErrors>({});
const isDialogOpen = ref(false);

const saveCategory = () => {
  const result =
    categoryId && category?.value
      ? editCategory(categoryId, { ...category.value, ...formState.value })
      : createCategory({
          ...formState.value,
          type: categoryType,
          userId: userId.value,
        });
  if (result.success) {
    formState.value.name = category?.value?.name ?? '';
    isDialogOpen.value = false;
  } else {
    formErrors.value = result.errors;
  }
};

const handleDialogOpenChange = (open: boolean) => {
  isDialogOpen.value = open;
};
</script>

<template>
  <DialogRoot
    class="dialog"
    :open="isDialogOpen"
    @update:open="handleDialogOpenChange"
  >
    <DialogTrigger as-child>
      <slot />
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="dialog__overlay" />
      <DialogContent
        class="dialog__content category-dialog__content"
        aria-describedby=""
      >
        <div class="dialog__header">
          <DialogTitle class="dialog__title">{{
            categoryId ? 'Edit category' : 'Create new category'
          }}</DialogTitle>
          <DialogClose
            class="btn dialog__close"
            data-variant="ghost"
            data-size="icon"
          >
            <XIcon :size="16" />
          </DialogClose>
        </div>

        <form class="form" @submit.prevent="saveCategory">
          <div class="form-item">
            <Label for="category-name" class="label">Name</Label>
            <input
              id="category-name"
              v-model="formState.name"
              name="name"
              type="text"
              class="input"
              :maxlength="CATEGORY_NAME_MAX_LENGTH"
            />
            <FormMessage
              v-if="formErrors.name"
              id="category-name-error"
              variant="error"
            >
              {{ formErrors.name }}
            </FormMessage>
          </div>

          <div v-if="allowParentSelect" class="form-item">
            <Label for="category-parent" class="label">Parent category</Label>
            <CategorySelect
              v-model="formState.parentId"
              input-id="category-parent"
              :user-id="userId"
              :category-type="categoryType"
              :only-parents="true"
              :excluded-categories="categoryId ? [categoryId] : []"
            />
          </div>

          <div class="form-item">
            <p id="category-color-label">Color</p>
            <RadioGroupRoot
              v-model="formState.color"
              name="color"
              class="category-color-group"
              aria-labelledby="category-color-label"
            >
              <template
                v-for="(color, colorName) in CATEGORY_COLORS"
                :key="color"
              >
                <RadioGroupItem
                  :id="colorName"
                  :value="colorName"
                  class="category-color-group__item"
                  :style="{ backgroundColor: color }"
                >
                  <RadioGroupIndicator class="category-color-group__indicator">
                    <CheckIcon class="category-color-group__indicator-icon" />
                  </RadioGroupIndicator>
                </RadioGroupItem>
                <Label :for="colorName" class="sr-only">
                  Color: {{ colorName }}
                </Label></template
              >
            </RadioGroupRoot>
          </div>

          <div class="form-item">
            <p id="category-icon-label">Icon</p>
            <RadioGroupRoot
              v-model="formState.icon"
              name="icon"
              class="category-icon-group"
              aria-labelledby="category-icon-label"
            >
              <template
                v-for="(Icon, iconName) in CATEGORY_ICONS"
                :key="iconName"
              >
                <RadioGroupItem
                  :id="iconName"
                  :value="iconName"
                  class="category-icon-group__item"
                >
                  <component
                    :is="Icon"
                    class="category-icon-group__item-icon"
                  />
                  <RadioGroupIndicator class="category-icon-group__indicator">
                    <CheckIcon class="category-icon-group__indicator-icon" />
                  </RadioGroupIndicator>
                </RadioGroupItem>
                <Label :for="iconName" class="sr-only">
                  {{ iconName }} icon
                </Label>
              </template>
            </RadioGroupRoot>
          </div>

          <div class="form__footer">
            <button type="submit" class="btn">
              Save {{ categoryId ? 'changes' : 'category' }}
            </button>
            <DialogClose as-child>
              <button class="btn" data-variant="outline">Cancel</button>
            </DialogClose>
          </div>
        </form>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style lang="scss" scoped>
@use '@globals/tools' as t;

.color-select__viewport {
  display: grid;
}

.color-select__color {
  width: 1rem;
  height: 1rem;
  display: block;
  border-radius: 100%;
}

.category-color-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category-color-group__item {
  width: t.px-to-rem(30px);
  height: t.px-to-rem(30px);
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid var(t.get-color-var('background'));
}

.category-color-group__indicator {
  font-size: t.px-to-rem(20px);
  color: #fff;
}

.category-color-group__indicator-icon {
  width: 1em;
  height: 1em;
}

.category-icon-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.category-icon-group__item {
  position: relative;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: t.px-to-rem(34px);
}

.category-icon-group__item-icon {
  width: 1em;
  height: 1em;
  color: var(t.get-color-var('foreground'));
}

.category-icon-group__indicator {
  position: absolute;
  inset-block-start: -20%;
  inset-inline-end: -20%;
  color: #fff;
}

.category-icon-group__indicator-icon {
  width: t.px-to-rem(20px);
  height: t.px-to-rem(20px);
  border-radius: 50%;
  color: var(t.get-color-var('accent-foreground'));
  background-color: var(t.get-color-var('accent'));
}
</style>
