import { coerce, number, refine, unknown, type Struct } from 'superstruct';

export const coerceToNumber = () =>
  coerce(number(), unknown(), (value) => Number(value));

export const positive = <T extends number>(
  struct: Struct<T, null>,
  msg?: string
) =>
  refine<T, null>(struct, 'positive', (value) => {
    if (value > 0) return true;
    return msg ?? 'Must be greater than 0';
  });
