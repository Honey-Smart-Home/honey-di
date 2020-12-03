export type Constructor<T> = Function & { prototype: T };
export interface IConstructor<T> { new(...args: any[]): T; }
export type FactoryFunction<T> = () => T;