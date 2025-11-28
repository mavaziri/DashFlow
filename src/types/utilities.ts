export type NonNullableFields<T> = {
  [K in keyof T]: NonNullable<T[K]>;
};

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredBy<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

export type ReadonlyDeep<T> = {
  readonly [K in keyof T]: T[K] extends object ? ReadonlyDeep<T[K]> : T[K];
};

export type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export type PickByType<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};

export type OmitByType<T, V> = {
  [K in keyof T as T[K] extends V ? never : K]: T[K];
};

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

export type XOR<T, U> = T | U extends object
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U;

export type ValueOf<T> = T[keyof T];

export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export type AsyncReturnType<T extends (...args: never[]) => Promise<unknown>> =
  T extends (...args: never[]) => Promise<infer R> ? R : never;

export type Awaited<T> = T extends Promise<infer U> ? U : T;

export type Constructor<T = object> = new (...args: never[]) => T;

export type AbstractConstructor<T = object> = abstract new (
  ...args: never[]
) => T;

export type Simplify<T> = { [K in keyof T]: T[K] } & NonNullable<unknown>;

export type UnionToIntersection<U> = (
  U extends never ? never : (k: U) => void
) extends (k: infer I) => void
  ? I
  : never;

export type ExcludeFromTuple<T extends readonly unknown[], U> = T extends [
  infer F,
  ...infer R
]
  ? [F] extends [U]
    ? ExcludeFromTuple<R, U>
    : [F, ...ExcludeFromTuple<R, U>]
  : [];

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & NonNullable<unknown>;
