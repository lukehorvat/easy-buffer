/**
 * See: https://stackoverflow.com/a/57103940
 */
export type DistributiveOmit<T, K extends keyof any> = T extends any
  ? Omit<T, K>
  : never;
