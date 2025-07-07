import type { Category } from './model';

type NormalizedFullCategories = {
  parents: {
    byId: Record<
      string,
      | (Category & { children: string[] | null; hasChildren: boolean })
      | undefined
    >;
    ids: string[];
  };
  children: {
    byId: Record<string, Category | undefined>;
    ids: string[];
  };
};

export function normalizeCategories(categories: Map<string, Category>) {
  const ds: NormalizedFullCategories = {
    parents: {
      byId: {},
      ids: [],
    },
    children: {
      byId: {},
      ids: [],
    },
  };

  categories.forEach((category, rowId) => {
    if (category.parentId) {
      const parent = ds.parents.byId[category.parentId] || {
        children: [],
        hasChildren: false,
      };
      parent.children = parent.children ?? [];
      parent.children.push(rowId);
      parent.hasChildren = true;
      ds.children.ids.push(rowId);
      ds.children.byId[rowId] = category;
    } else {
      ds.parents.ids.push(rowId);
      ds.parents.byId[rowId] = {
        ...category,
        children: ds.parents.byId[rowId]?.children || null,
        hasChildren: ds.parents.byId[rowId]?.hasChildren || false,
      };
    }
  });

  return ds;
}

export function makeNestedCategories(categories: Map<string, Category>) {
  const mapCopy = structuredClone(categories);
  const ds: (Category & {
    id: string;
    children: (Category & { id: string })[];
  })[] = [];

  categories.forEach((category, id) => {
    if (!category.parentId) {
      const cat = mapCopy.get(id) as (typeof ds)[number];
      if (cat) {
        cat.id = id;
        cat.children = [];
        ds.push(cat);
      }
    } else {
      const parent = mapCopy.get(category.parentId) as (typeof ds)[number];
      if (parent) {
        parent.children = parent.children ?? [];
        parent.children.push({ ...category, id });
      }
    }
  });

  return ds;
}
