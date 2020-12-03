import { ITypedRegistration } from "./interfaces";
import { IConstructor, FactoryFunction } from "./types";

export class SingletonRegistration<T> implements ITypedRegistration<T> {

    private _instance: T | undefined;

    constructor(private _type: IConstructor<T>) {  }

    resolve(builder: (type: IConstructor<T>) => any[]): T {
        if(this._instance !== undefined)
            return this._instance;
        const args: any[] = builder(this._type);
        this._instance = new this._type(...args);
        return this._instance;
    }

}

export class TransientRegistration<T> implements ITypedRegistration<T> {

    constructor(private _type: IConstructor<T>) {  }

    resolve(builder: (type: IConstructor<T>) => any[]): T {
        const args: any[] = builder(this._type);
        return new this._type(...args);
    }

}

export class InstanceRegistration<T> implements ITypedRegistration<T> {

    constructor(private _instance: T) {  }

    resolve(builder: (type: IConstructor<T>) => any[]): T {
        return this._instance;
    }

}

export class FactoryRegistration<T> implements ITypedRegistration<T> {

    constructor(private _factory: FactoryFunction<T>) {  }

    resolve(builder: (type: IConstructor<T>) => any[]): T {
        return this._factory();
    }

}

export class SingletonFactoryRegistration<T> implements ITypedRegistration<T> {
    private _instance: T | undefined;

    constructor(private _factory: FactoryFunction<T>) {
    }

    public resolve(builder: (type: IConstructor<T>) => any[]): T {
        if (this._instance != undefined)
            return this._instance;
        this._instance = this._factory();
        return this._instance;
    }
}