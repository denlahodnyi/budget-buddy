import type { TablesSchema, ValuesSchema } from 'tinybase/with-schemas';

// TODO: use this in place of string literals
export const TransactionTypes = {
  INCOME: 'income',
  EXPENSE: 'expense',
} as const;

const DEFAULT_USER_ID = '0';
const DEFAULT_WALLET_ID = '0';

export const storeTablesSchema = {
  users: {
    name: { type: 'string', default: 'user_1' },
    // TODO: add color field
  },
  wallets: {
    name: { type: 'string', default: 'Main wallet' },
    // balance: { type: 'number', default: 0 },
    currency: { type: 'string', default: 'USD' },
    createdAt: { type: 'string', default: new Date().toISOString() },
    userId: { type: 'string' }, // Reference to user
  },
  transactions: {
    type: { type: 'string', default: 'expense' }, // 'expense' or 'income'
    amount: { type: 'number', default: 0 },
    createdAt: { type: 'string', default: new Date().toISOString() },
    userId: { type: 'string' }, // Reference to user
    walletId: { type: 'string' }, // Reference to wallet
    // TODO: add category field
    // TODO: add description field
  },
} satisfies TablesSchema;

export const storeValuesSchema = {
  userId: { type: 'string', default: DEFAULT_USER_ID },
  walletId: { type: 'string', default: DEFAULT_WALLET_ID },
} satisfies ValuesSchema;
