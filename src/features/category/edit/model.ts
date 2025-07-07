import { validate } from 'superstruct';
import { createRelationships } from 'tinybase/with-schemas';

import {
  CreatedCategoryScheme,
  NO_PARENT_VAL,
  type CreatedCategory,
  type CreatedCategoryErrors,
} from '~/entities/category';
import { store } from '~/store';

export function editCategory(
  categoryId: string,
  partiallyEditedCategory: CreatedCategory
) {
  const [err, obj] = validate(partiallyEditedCategory, CreatedCategoryScheme, {
    coerce: true,
  });

  if (err) {
    const errors: CreatedCategoryErrors = {};
    for (const failure of err.failures()) {
      errors[failure.key as keyof CreatedCategoryErrors] = failure.message;
    }
    return { success: false, errors } as const;
  }

  const originalCategory = store.getRow('categories', categoryId);

  if (originalCategory.parentId !== obj.parentId) {
    let finalParentId: string | undefined = undefined;

    if (obj.parentId && obj.parentId !== NO_PARENT_VAL) {
      const parentCategory = store.getRow('categories', obj.parentId);
      const relationships = createRelationships(store);
      const reName = 'editAction_linkedCategories';
      relationships.setRelationshipDefinition(
        reName,
        'categories',
        'categories',
        'parentId'
      );
      const childrenIds = relationships.getLocalRowIds(reName, obj.parentId);
      relationships.delRelationshipDefinition(reName);

      if (!childrenIds.length) {
        const clonedParentId = store.addRow('categories', parentCategory);
        if (clonedParentId) {
          store.setPartialRow('categories', obj.parentId, {
            parentId: clonedParentId,
          });
          finalParentId = clonedParentId;
        } else {
          throw new Error('Failed to create parent category');
        }
      } else {
        finalParentId = obj.parentId;
      }
    }

    obj.parentId = finalParentId;
  }

  store.setPartialRow('categories', categoryId, obj);
  if (!obj.parentId && originalCategory.parentId) {
    store.delCell('categories', categoryId, 'parentId');
  }

  return { success: true } as const;
}
