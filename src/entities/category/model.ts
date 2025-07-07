import type { ResultCell, Row } from 'tinybase/with-schemas';
import {
  computed,
  shallowRef,
  toRef,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue';
import { isEmpty } from 'lodash-es';
import {
  enums,
  nonempty,
  object,
  optional,
  size,
  string,
  trimmed,
  type Describe,
  type Infer,
} from 'superstruct';

import {
  useResultRow,
  useResultRowIds,
  useRow,
  type SchemaFromQueries,
} from '~/shared/lib/tiny-base';
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  queries,
  setFullCategoriesQuery,
  setParentOnlyCategoriesQuery,
  setSubCategoriesQuery,
  store,
  type storeTablesSchema,
} from '~/store';

export const CATEGORY_NAME_MAX_LENGTH = 50;

type StoredCategory = Row<typeof storeTablesSchema, 'categories'>;

export interface Category extends StoredCategory {
  type: 'income' | 'expense';
  name: string;
  userId: string;
  icon: keyof typeof CATEGORY_ICONS;
  color: keyof typeof CATEGORY_COLORS;
}

export const CATEGORY_ICON_NAMES = Object.keys(
  CATEGORY_ICONS
) as Category['icon'][];
export const CATEGORY_COLOR_NAMES = Object.keys(
  CATEGORY_COLORS
) as Category['color'][];

export const CreatedCategoryScheme: Describe<Category> = object({
  type: enums(['income', 'expense']),
  name: nonempty(trimmed(size(string(), 3, CATEGORY_NAME_MAX_LENGTH))),
  color: enums(Object.keys(CATEGORY_COLORS) as typeof CATEGORY_COLOR_NAMES),
  icon: enums(Object.keys(CATEGORY_ICONS) as typeof CATEGORY_ICON_NAMES),
  userId: nonempty(string()),
  parentId: optional(string()),
});

export type CreatedCategory = Infer<typeof CreatedCategoryScheme>;

export type CreatedCategoryErrors = {
  [Key in keyof CreatedCategory]?: string;
};

// get parent categories ids
export function useParentCategoriesIds(
  userId: MaybeRefOrGetter<string>,
  categoryType?: MaybeRefOrGetter<Category['type']>
) {
  const settledQuery = shallowRef(
    setParentOnlyCategoriesQuery(
      queries,
      toValue(userId),
      toValue(categoryType)
    )
  );
  watch(
    [() => toValue(userId), () => toValue(categoryType)],
    ([newUserId, newCategoryType]) => {
      settledQuery.value = setParentOnlyCategoriesQuery(
        queries,
        newUserId,
        newCategoryType
      );
    }
  );
  const ids = useResultRowIds({
    queryId: () => settledQuery.value.queryId,
    queries,
  });
  return { ids, queryId: toRef(() => settledQuery.value.queryId) };
}

export function useSubcategoriesIds(
  parentCategoryId: MaybeRefOrGetter<NonNullable<Category['parentId']>>
) {
  const settledQuery = shallowRef(
    setSubCategoriesQuery(queries, toValue(parentCategoryId))
  );
  watch(
    () => toValue(parentCategoryId),
    (newParentId) => {
      settledQuery.value = setSubCategoriesQuery(queries, newParentId);
    }
  );
  const ids = useResultRowIds({
    queryId: () => settledQuery.value.queryId,
    queries,
  });

  return { ids, queryId: toRef(() => settledQuery.value.queryId) };
}

export function useCategory(categoryId: MaybeRefOrGetter<string>) {
  const category = useRow({ store, tableId: 'categories', rowId: categoryId });

  return computed(() =>
    isEmpty(category.value) ? null : (category.value as Category)
  );
}

export function useCategoryByQuery(
  categoryId: MaybeRefOrGetter<string>,
  queryId: MaybeRefOrGetter<string>
) {
  const category = useResultRow<
    Category & { [key: string]: ResultCell },
    SchemaFromQueries<typeof queries>
  >({
    queryId,
    queries,
    rowId: categoryId,
  });

  return computed(() =>
    isEmpty(category.value) ? null : (category.value as Category)
  );
}

export function useCategoriesIds(
  userId: MaybeRefOrGetter<string>,
  categoryType: MaybeRefOrGetter<Category['type'] | 'all'>,
  onlyParents?: MaybeRefOrGetter<boolean>
) {
  const settledQuery = shallowRef(
    setFullCategoriesQuery(
      queries,
      toValue(userId),
      toValue(categoryType) === 'all' ? undefined : toValue(categoryType),
      toValue(onlyParents)
    )
  );
  watch(
    [
      () => toValue(userId),
      () => toValue(categoryType),
      () => toValue(onlyParents),
    ],
    ([newUserId, newCategoryType, newOnlyParents]) => {
      settledQuery.value = setFullCategoriesQuery(
        queries,
        newUserId,
        newCategoryType === 'all' ? undefined : newCategoryType,
        newOnlyParents
      );
    }
  );
  const ids = useResultRowIds({
    queryId: () => settledQuery.value.queryId,
    queries,
  });

  return { ids, queryId: toRef(settledQuery.value.queryId) };
}

export function useFullCategories(
  userId: MaybeRefOrGetter<string>,
  categoryType: MaybeRefOrGetter<Category['type'] | 'all'>,
  onlyParents?: MaybeRefOrGetter<boolean>,
  excludedIds?: MaybeRefOrGetter<string[]>
) {
  const settledQuery = shallowRef(
    setFullCategoriesQuery(
      queries,
      toValue(userId),
      toValue(categoryType) === 'all' ? undefined : toValue(categoryType),
      toValue(onlyParents)
    )
  );

  watch(
    [
      () => toValue(userId),
      () => toValue(categoryType),
      () => toValue(onlyParents),
    ],
    ([newUserId, newCategoryType, newOnlyParents]) => {
      settledQuery.value = setFullCategoriesQuery(
        queries,
        newUserId,
        newCategoryType === 'all' ? undefined : newCategoryType,
        newOnlyParents
      );
    }
  );

  const ids = useResultRowIds({
    queries,
    queryId: () => settledQuery.value.queryId,
  });

  const categories = computed(() => {
    const ds = new Map<string, Category>();
    const idsToExclude = toValue(excludedIds) ?? [];
    ids.value.forEach((rowId) => {
      if (!idsToExclude.includes(rowId)) {
        const category = queries.getResultRow(
          settledQuery.value.queryId,
          rowId
        ) as unknown as Category;
        ds.set(rowId, category);
      }
    });
    return ds;
  });

  return { categories, queryId: toRef(() => settledQuery.value.queryId) };
}
