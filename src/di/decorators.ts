import 'reflect-metadata';

export function Injectable() {
    return function<T extends { new(...args: any[]): {} }>(constructor: T) {
        Reflect.defineMetadata("DI:SupportsInjection", true, constructor.prototype);
        Reflect.defineMetadata("DI:Injectable", true, constructor.prototype);
    }
}

export function SupportsInjection() {
    return function<T extends { new(...args: any[]): {} }>(constructor: T) {
        Reflect.defineMetadata("DI:SupportsInjection", true, constructor.prototype);
    }
}