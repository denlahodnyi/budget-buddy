import type { TablesSchema, ValuesSchema } from 'tinybase/with-schemas';

import type { CATEGORY_COLORS, CATEGORY_ICONS } from './data/categories';

export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
} as const;

export const CURRENCY_TYPES = {
  FIAT: 'fiat',
  CRYPTO: 'crypto',
  CUSTOM: 'custom',
} as const;

export type TransactionType =
  (typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES];

export type CurrencyType = (typeof CURRENCY_TYPES)[keyof typeof CURRENCY_TYPES];

const DEFAULT_USER_ID = '0';
const DEFAULT_WALLET_ID = '0';
const DEFAULT_CURRENCY_ID = '0';

export const DEFAULT_CAT_ICON: keyof typeof CATEGORY_ICONS = 'other';
export const DEFAULT_CAT_COLOR: keyof typeof CATEGORY_COLORS = 'pink';

export const storeTablesSchema = {
  users: {
    name: { type: 'string', default: 'user_1' },
  },
  wallets: {
    name: { type: 'string', default: 'Main wallet' },
    createdAt: { type: 'string', default: new Date().toISOString() },
    userId: { type: 'string', default: DEFAULT_USER_ID }, // Reference to user
    currencyId: { type: 'string', default: DEFAULT_CURRENCY_ID },
  },
  transactions: {
    type: { type: 'string', default: TRANSACTION_TYPES.INCOME },
    amount: { type: 'number', default: 0 },
    createdAt: { type: 'number', default: Date.now() },
    userId: { type: 'string' }, // Reference to user
    walletId: { type: 'string' }, // Reference to wallet
    categoryId: { type: 'string' },
    description: { type: 'string' },
  },
  categories: {
    name: { type: 'string' },
    type: { type: 'string', default: TRANSACTION_TYPES.INCOME },
    userId: { type: 'string' },
    parentId: { type: 'string' },
    color: { type: 'string', default: DEFAULT_CAT_COLOR },
    icon: { type: 'string', default: DEFAULT_CAT_ICON },
  },
  currencies: {
    code: { type: 'string' },
    name: { type: 'string' },
    type: { type: 'string' }, // fiat | crypto | custom
    isISO: { type: 'boolean' },
    decimalPlaces: { type: 'number' },
    symbol: { type: 'string' }, // optional
    userId: { type: 'string' }, // optional
  },
  userExchangeRates: {
    // id --> userId_code
    rate: { type: 'number' },
  },
} satisfies TablesSchema;

export const storeValuesSchema = {
  userId: { type: 'string', default: DEFAULT_USER_ID },
  walletId: { type: 'string', default: DEFAULT_WALLET_ID },
  firstInit: { type: 'boolean' },
} satisfies ValuesSchema;

export type StoreSchema = [typeof storeTablesSchema, typeof storeValuesSchema];
