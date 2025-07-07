import { createRelationships } from 'tinybase/with-schemas';

import {
  queries,
  setTransactionsCountPerCategoryQuery,
  store,
  type TransactionsPerCatQueryResult,
} from '~/store';

const countTransactionsPerCategories = (categoryIds: string[]) => {
  const { queryId } = setTransactionsCountPerCategoryQuery(
    queries,
    categoryIds
  );
  const ids = queries.getResultRowIds(queryId);
  const result = ids.map(
    (id) => queries.getResultRow(queryId, id) as TransactionsPerCatQueryResult
  );
  queries.delQueryDefinition(queryId);
  return result;
};

const getLinkedTransactionsIds = (categoryId: string) => {
  const relationships = createRelationships(store);
  relationships.setRelationshipDefinition(
    'delAction_linkedTransactions',
    'transactions',
    'categories',
    'categoryId'
  );
  const transactionIds = relationships.getLocalRowIds(
    'delAction_linkedTransactions',
    categoryId
  );
  relationships.delRelationshipDefinition('delAction_linkedTransactions');

  return transactionIds;
};

export function* deleteCategory(categoryId: string) {
  const category = store.getRow('categories', categoryId);

  if (!category.parentId) {
    const relationships = createRelationships(store);
    const relName = 'delAction_linkedCategories';
    relationships.setRelationshipDefinition(
      relName,
      'categories',
      'categories',
      'parentId'
    );
    // Get children IDs for the selected parent category to check weather it's a parent
    const childrenIds = relationships.getLocalRowIds(relName, categoryId);
    relationships.delRelationshipDefinition(relName);

    if (childrenIds.length) {
      const countResults = countTransactionsPerCategories(childrenIds);
      const totalTransactionsPerChildren = countResults.reduce((prev, cur) => {
        return prev + (cur.total ?? 0);
      }, 0);

      // If some children categories are used by some transactions – reassign them
      if (totalTransactionsPerChildren > 0) {
        // Ask user for the new category to reassign
        const newCategoryId: string = yield {
          isNewCategoryRequired: true,
          transactionsCount: totalTransactionsPerChildren,
          success: false,
        } as const;

        if (!newCategoryId) {
          throw new Error(
            "Cannot reassign category id: new id wasn't selected"
          );
        }

        store.transaction(() => {
          countResults.forEach(({ id, total = 0 }) => {
            if (id && total > 0) {
              const transactionIds = getLinkedTransactionsIds(id);
              transactionIds.forEach((transactionId) => {
                store.setPartialRow('transactions', transactionId, {
                  categoryId: newCategoryId,
                });
              });
            }
          });
        });
      }

      // ...otherwise just delete this category with all its children
      store.transaction(() => {
        [categoryId, ...childrenIds].forEach((id) => {
          store.delRow('categories', id);
        });
      });

      return { success: true } as const;
    }
  }

  // Count related transactions
  const [countResult = null] = countTransactionsPerCategories([categoryId]);

  if (countResult?.total !== undefined && countResult?.total > 0) {
    // Ask user to provide category id for related transactions
    const newCategoryId: string = yield {
      isNewCategoryRequired: true,
      transactionsCount: countResult.total,
      success: false,
    } as const;

    if (!newCategoryId) {
      throw new Error("Cannot reassign category id: new id wasn't selected");
    }

    const transactionIds = getLinkedTransactionsIds(categoryId);

    if (transactionIds.length) {
      store.transaction(() => {
        // Reassign category id to the selected one
        transactionIds.forEach((transactionId) => {
          store.setPartialRow('transactions', transactionId, {
            categoryId: newCategoryId,
          });
        });
        store.delRow('categories', categoryId);
      });
    }

    return { success: true } as const;
  } else {
    // just delete
    store.delRow('categories', categoryId);
    return { success: true } as const;
  }
}
