import {
  coerce,
  number,
  refine,
  string,
  unknown,
  type Struct,
} from 'superstruct';

export const coerceToNumber = <T extends number>(
  numLikeStruct?: Struct<T, null>
) =>
  coerce(
    numLikeStruct ?? (number() as unknown as Struct<T, null>),
    unknown(),
    (value) => Number(value)
  );

export const coerceToUppercase = () =>
  coerce(string(), string(), (value) => value.toUpperCase());

export const positive = <T extends number>(
  numLikeStruct: Struct<T, null>,
  msg?: string
) =>
  refine<T, null>(numLikeStruct, 'positive', (value) => {
    if (value > 0) return true;
    return msg ?? 'Must be greater than 0';
  });
