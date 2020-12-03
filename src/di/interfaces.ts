import { IConstructor } from "./types";

export interface IRegistration {  }

export interface ITypedRegistration<T> extends IRegistration {
    resolve(argumentBuilder: (type: IConstructor<T>) => any[]): T;
}
