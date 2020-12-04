export type Class<T> = Function & { prototype: T };
export interface IConcreteConstructor<T> { new(...args: any[]): T; }