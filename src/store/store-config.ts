import type { TablesSchema, ValuesSchema } from 'tinybase/with-schemas';
import {
  BanknoteArrowUpIcon,
  BriefcaseMedicalIcon,
  CarIcon,
  CoinsIcon,
  DropletIcon,
  Gamepad2Icon,
  GiftIcon,
  HammerIcon,
  HandCoinsIcon,
  HouseIcon,
  LibraryBigIcon,
  MartiniIcon,
  PackageIcon,
  PartyPopperIcon,
  PhoneIcon,
  PiggyBank,
  PizzaIcon,
  ShoppingBasketIcon,
  TreePalmIcon,
  WifiIcon,
} from 'lucide-vue-next';

// TODO: use this in place of string literals
export const TransactionTypes = {
  INCOME: 'income',
  EXPENSE: 'expense',
} as const;

const DEFAULT_USER_ID = '0';
const DEFAULT_WALLET_ID = '0';

const CATEGORY_COLORS = {
  // _default: '',
  blue: '#0075C4',
  blue_1: '#71A9F7',
  green: '#2CA58D',
  green_1: '#6F732F',
  red: '#D7263D',
  pink: '#EC91D8',
  pink_1: '#FFA5AB',
  violet: '#D9BBF9',
  violet_1: '#5F0A87',
  orange: '#FF7700',
  orange_1: '#EC4E20',
  yellow: '#FDE12D',
  lime: '#E0FF4F',
  brown: '#774936',
};

export { CATEGORY_COLORS };

export const DEFAULT_CAT_ICON: keyof typeof CATEGORY_ICONS = 'other';
export const DEFAULT_CAT_COLOR: keyof typeof CATEGORY_COLORS = 'pink';

export const CATEGORY_ICONS = {
  // _default: 'other',
  other: CoinsIcon,
  car: CarIcon,
  shopping: ShoppingBasketIcon,
  house: HouseIcon,
  income: BanknoteArrowUpIcon,
  phone: PhoneIcon,
  party: PartyPopperIcon,
  box: PackageIcon,
  cocktail: MartiniIcon,
  icons: HandCoinsIcon,
  gift: GiftIcon,
  gamepad: Gamepad2Icon,
  doctor: BriefcaseMedicalIcon,
  book: LibraryBigIcon,
  tool: HammerIcon,
  island: TreePalmIcon,
  wifi: WifiIcon,
  bank: PiggyBank,
  pizza: PizzaIcon,
  water: DropletIcon,
};

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
    type: { type: 'string', default: 'income' }, // 'expense' or 'income'
    amount: { type: 'number', default: 0 },
    createdAt: { type: 'string', default: new Date().toISOString() },
    userId: { type: 'string' }, // Reference to user
    walletId: { type: 'string' }, // Reference to wallet
    categoryId: { type: 'string' },
    description: { type: 'string' },
  },
  categories: {
    name: { type: 'string' },
    type: { type: 'string', default: 'income' },
    userId: { type: 'string' },
    parentId: { type: 'string' },
    color: { type: 'string', default: DEFAULT_CAT_COLOR },
    icon: { type: 'string', default: DEFAULT_CAT_ICON },
  },
} satisfies TablesSchema;

export const storeValuesSchema = {
  userId: { type: 'string', default: DEFAULT_USER_ID },
  walletId: { type: 'string', default: DEFAULT_WALLET_ID },
} satisfies ValuesSchema;
