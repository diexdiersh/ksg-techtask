export type Replace<T, R> = {
  [K in keyof T]: R
}
