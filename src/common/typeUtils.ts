export type Override<SourceType, OverrideType> = Omit<SourceType, keyof OverrideType> & OverrideType;

export type Unpacked<T> =
    T extends (infer U)[] ? U :
    T extends (...args: unknown[]) => infer U ? U :
    T extends Promise<infer U> ? U :
    T;
