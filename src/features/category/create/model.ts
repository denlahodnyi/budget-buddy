import { validate } from 'superstruct';
import { createRelationships } from 'tinybase/with-schemas';

import {
  CreatedCategoryScheme,
  NO_PARENT_VAL,
  type CreatedCategory,
  type CreatedCategoryErrors,
} from '~/entities/category';
import { store } from '~/store';

export function createCategory(category: CreatedCategory) {
  const [err, obj] = validate(category, CreatedCategoryScheme, {
    coerce: true,
  });

  if (err) {
    const errors: CreatedCategoryErrors = {};
    for (const failure of err.failures()) {
      errors[failure.key as keyof CreatedCategoryErrors] = failure.message;
    }
    return { success: false, errors } as const;
  }

  let finalParentId: string | undefined = undefined;

  if (category.parentId && category.parentId !== NO_PARENT_VAL) {
    const parentCategory = store.getRow('categories', category.parentId);
    const relationships = createRelationships(store);
    const relName = 'createAction_linkedCategories';
    relationships.setRelationshipDefinition(
      relName,
      'categories',
      'categories',
      'parentId'
    );
    // Get children IDs for the selected parent category to check weather it's a parent
    const childrenIds = relationships.getLocalRowIds(
      relName,
      category.parentId
    );
    relationships.delRelationshipDefinition(relName);

    if (!childrenIds.length) {
      // Selected category is not ready to be parent. Firstly, create its clone
      const clonedParentId = store.addRow('categories', parentCategory);
      if (clonedParentId) {
        // Secondly, make selected parent category to be a subcategory of its clone
        store.setPartialRow('categories', category.parentId, {
          parentId: clonedParentId,
        });
        // Now, new category can become subcategory
        finalParentId = clonedParentId;
      } else {
        throw new Error('Failed to create parent category');
      }
    } else {
      // Otherwise, selected category is already a parent and can be safely become a parent
      // for the newly created category
      finalParentId = category.parentId;
    }
  }

  const categoryId = store.addRow('categories', {
    ...obj,
    parentId: finalParentId,
  });

  return { success: true, categoryId } as const;
}
