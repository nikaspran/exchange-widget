export type Override<SourceType, OverrideType> = Omit<SourceType, keyof OverrideType> & OverrideType;
