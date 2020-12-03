import { Constructor, FactoryFunction, IConstructor } from "./types";
import { FactoryRegistration, InstanceRegistration, SingletonRegistration, TransientRegistration, SingletonFactoryRegistration } from "./registrations";
import { IRegistration } from "./interfaces";
import { ITypedRegistration } from "../di/interfaces";

export class Container {

    private _parameterTypes: Map<Function, any[]> = new Map<Function, any[]>();
    private _providers: Map<Function, IRegistration> = new Map<Function, IRegistration>();

    public registerTransient<T>(self: IConstructor<T>): void;
    public registerTransient<From, To extends From>(when: Constructor<From>, then: IConstructor<To>): void;
    public registerTransient<From, To extends From>(when: Constructor<From> | IConstructor<From>, then?: IConstructor<To>): void {
        if (when == undefined) {
            throw new Error(`Cannot register null or undefined as transient. Did you intend to call unregister?`);
        }
        if (then == undefined) {
            then = when as IConstructor<To>;
        }

        this.register(when, then, new TransientRegistration<To>(then));
    }

    public registerSingleton<T>(self: IConstructor<T>): void;
    public registerSingleton<From, To extends From>(when: Constructor<From>, then: IConstructor<To>): void;
    public registerSingleton<From, To extends From>(when: Constructor<From> | IConstructor<From>, then?: IConstructor<To>): void {
        if (when == undefined) {
            throw new Error(`Cannot register null or undefined as singleton. Did you intend to call unregister?`);
        }
        if (then == undefined) {
            then = when as IConstructor<To>;
        }

        this.register(when, then, new SingletonRegistration<To>(then));
    }

    public registerInstance<T>(when: Constructor<T>, then: T): void {
        if (then == undefined) {
            throw new Error(`Cannot register null or undefined as instance. Did you intend to call unregister?`);
        }
        if (typeof(then) !== typeof(when.prototype)) {
            throw new Error(`You need to register an instance with the same type as the prototype of the source.`);
        }

        this._providers.set(when, new InstanceRegistration<T>(then));
    }

    public registerFactory<T>(when: Constructor<T>, then: FactoryFunction<T>) {
        if (then == undefined) {
            throw new Error(`Cannot register null or undefined as factory. Did you intend to call unregister?`);
        }

        this._providers.set(when, new FactoryRegistration<T>(then));
    }

    public registerSingletonFactory<T>(when: Constructor<T>, then: FactoryFunction<T>) {
        if (then == undefined) {
            throw new Error(`Cannot register null or undefined as singleton factory. Did you intend to call unregister?`);
        }

        this._providers.set(when, new SingletonFactoryRegistration<T>(then));
    }

    public unregister<T>(type: Constructor<T>): void {
        if (type == undefined) {
            throw new Error(`Cannot unregister null or undefined type`);
        }

        const registration = this._providers.get(type);
        if (registration == undefined) {
            return;
        }

        this._providers.delete(type);
    }

    public resolve<T>(type: Constructor<T>): T {
        if (type == undefined) {
            throw new Error(`Cannot resolve null or undefined type`);
        }

        const registration = this._providers.get(type) as ITypedRegistration<T>;
        if (registration == undefined) {
            throw new Error(`No registration found for type '${type.name}'`);
        }

        return registration.resolve((toResolve) => this.createArgs(toResolve));
    }

    private register<From, To extends From>(when: Constructor<From>, then: IConstructor<To>, registration: IRegistration): void {
        if(!Reflect.hasMetadata("DI:SupportsInjection", then.prototype))
            throw new Error(`${then.name} does not support injection! Forgot to add '@Injectable()' to the class ?`);
        const paramTypes: any[] = Reflect.getMetadata("design:paramtypes", then);
        this._parameterTypes.set(then, paramTypes);
        this._providers.set(when, registration);
    }

    private createArgs<T>(type: IConstructor<T>): any[] {
        const paramTypes = this._parameterTypes.get(type);
        if (paramTypes == undefined) {
            return [];
        }
        paramTypes.forEach(x => {
            if(!Reflect.getMetadata("DI:Injectable", x.prototype))
                throw new Error(`'${x.name}' is not injectable!`);
        });
        return paramTypes.map((x) => this.resolve(x));
    }

}