import type { Row } from 'tinybase/with-schemas';

import type { StoreSchema } from '../store-config';

export type QueryKeys = unknown[];

export type RowWithPrefixedCellIds<
  TTableName extends keyof StoreSchema[0],
  TPrefix extends string
> = {
  [Key in keyof Row<StoreSchema[0], TTableName> as `${TPrefix}${Key}`]: Row<
    StoreSchema[0],
    TTableName
  >[Key];
};
