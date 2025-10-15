export type Bindings = Record<string, unknown>;

export type LogObject = Record<string, unknown>;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface LogFn {
  (...object: LogObject[]): void;
  (message: string): void;
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  (message: string, ...object: LogObject[]): void;
}
