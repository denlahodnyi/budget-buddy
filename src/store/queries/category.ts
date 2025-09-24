import type { Queries } from 'tinybase/with-schemas';

import type { StoreSchema, TransactionType } from '../store-config';
import type { QueryKeys } from './util-types';
import { createQuerySetter, selectAll } from './utils';

export function setParentOnlyCategoriesQuery(
  queries: Queries<StoreSchema>,
  userId: string,
  categoryType?: TransactionType,
  ...keys: QueryKeys
) {
  return createQuerySetter<StoreSchema, 'categories'>('categories', () => ({
    queryKeys: [
      setParentOnlyCategoriesQuery.name,
      userId,
      categoryType,
      ...keys,
    ],
    queryDefinition: ({ select, where }) => {
      selectAll(select, 'categories');
      where(
        (getCell) =>
          (getCell('userId') === userId || !getCell('userId')) &&
          !getCell('parentId') &&
          (categoryType ? getCell('type') === categoryType : true)
      );
    },
  }))(queries);
}

export function setSubCategoriesQuery(
  queries: Queries<StoreSchema>,
  parentCategoryId: string,
  ...keys: QueryKeys
) {
  return createQuerySetter<StoreSchema, 'categories'>('categories', () => ({
    queryKeys: [setSubCategoriesQuery.name, parentCategoryId, ...keys],
    queryDefinition: ({ select, where }) => {
      selectAll(select, 'categories');
      where('parentId', parentCategoryId);
    },
  }))(queries);
}

export function setFullCategoriesQuery(
  queries: Queries<StoreSchema>,
  userId: string,
  categoryType?: TransactionType,
  onlyParents?: boolean,
  ...keys: QueryKeys
) {
  return createQuerySetter<StoreSchema, 'categories'>('categories', () => ({
    queryKeys: [
      setFullCategoriesQuery.name,
      userId,
      categoryType,
      onlyParents ? 'parentsOnly' : '',
      ...keys,
    ],
    queryDefinition: ({ select, where }) => {
      selectAll(select, 'categories');
      where(
        (getCell) =>
          (getCell('userId') === userId || !getCell('userId')) &&
          (onlyParents ? !getCell('parentId') : true) &&
          (categoryType ? getCell('type') === categoryType : true)
      );
    },
  }))(queries);
}
