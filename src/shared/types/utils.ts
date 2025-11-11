export type IdType<T> = T extends { id: infer Id } ? Id : never;

export type FullPartial<T> = {
  [P in keyof T]?: T[P] | undefined;
};
