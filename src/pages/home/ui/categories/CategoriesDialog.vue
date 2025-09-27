<script setup lang="ts">
import { PlusIcon, XIcon } from 'lucide-vue-next';
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from 'radix-vue';
import { ref } from 'vue';

import { useParentCategoriesIds, type Category } from '~/entities/category';
import { useCurrentUserId } from '~/entities/user';
import CategoryDialog from './CategoryDialog.vue';
import ManageableParentCategory from './ManageableParentCategory.vue';

const categoriesType = ref<Category['type']>('income');
const userId = useCurrentUserId();
const { ids: categoriesIds, queryId } = useParentCategoriesIds(
  userId,
  categoriesType
);
</script>

<template>
  <DialogRoot class="dialog">
    <DialogTrigger as-child>
      <slot />
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="dialog__overlay" />
      <DialogContent class="dialog__content" aria-describedby="">
        <div class="dialog__header">
          <DialogTitle class="dialog__title">Manage categories</DialogTitle>
          <DialogClose
            class="btn dialog__close"
            data-variant="ghost"
            data-size="icon"
            aria-label="Close categories dialog"
          >
            <XIcon />
          </DialogClose>
        </div>

        <TabsRoot v-model="categoriesType" class="categories-tabs">
          <div class="categories__toolbar">
            <TabsList class="categories-tabs__list">
              <TabsIndicator class="categories-tabs__indicator" />
              <TabsTrigger
                value="income"
                class="btn categories-tabs__trigger"
                data-variant="ghost"
              >
                Income
              </TabsTrigger>
              <TabsTrigger
                value="expense"
                class="btn categories-tabs__trigger"
                data-variant="ghost"
              >
                Expense
              </TabsTrigger>
            </TabsList>
            <CategoryDialog
              :category-type="categoriesType"
              :allow-parent-select="true"
            >
              <button
                class="btn"
                data-variant="ghost"
                data-size="icon"
                aria-label="Add new category"
              >
                <PlusIcon :size="16" />
              </button>
            </CategoryDialog>
          </div>
          <TabsContent value="income" class="categories-tabs__content">
            <div role="list" class="categories-list">
              <ManageableParentCategory
                v-for="id of categoriesIds"
                :id="id"
                :key="id"
                :parent-categories-query-id="queryId"
                role="listitem"
              />
            </div>
          </TabsContent>
          <TabsContent value="expense" class="categories-tabs__content">
            <div role="list" class="categories-list">
              <ManageableParentCategory
                v-for="id of categoriesIds"
                :id="id"
                :key="id"
                :parent-categories-query-id="queryId"
                role="listitem"
              />
            </div>
          </TabsContent>
        </TabsRoot>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style lang="scss" scoped>
@use '@globals/tools' as t;
$dialog-side-padding: 25px;

.dialog__content {
  padding-inline: 0;
  display: grid;
  grid-template: 1fr / 1fr;
}

.dialog__header {
  padding-inline: $dialog-side-padding;
}

.categories-tabs {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.categories__toolbar {
  padding-block-end: 20px;
  padding-inline: $dialog-side-padding;
  display: flex;
  align-items: center;
  gap: t.px-to-rem(10px);
}

.categories-tabs__list {
  position: relative;
  flex: 1;
  width: auto;
  display: flex;
  flex-shrink: 0;
  border-right: 2px solid var(t.get-color-var('border'));
}

.categories-tabs__content {
  overflow: auto;

  padding-inline: $dialog-side-padding;
}

.categories-tabs__indicator {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 2px;
  width: var(--radix-tabs-indicator-size);
  padding: 0 2rem;
  transform: translateX(var(--radix-tabs-indicator-position));
  border-radius: 9999px; /* rounded-full equivalent */
  transition-property: width, transform;
  transition-duration: 300ms;
  &::before {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    background-color: var(t.get-color-var('accent'));
  }
}

.categories-tabs__trigger {
  height: t.px-to-rem(40px);
  padding: 0 t.px-to-rem(10px);
  flex: 1;
  &:hover {
    --_hover-bg: transparent;
    --_hover-color: var(--_color);
  }
}

.categories-list {
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: t.px-to-rem(10px);
}
</style>
