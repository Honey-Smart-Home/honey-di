import { Scope } from "./scope.enum";
import { Class, IConcreteConstructor } from "./types";

export class Bind<T> {

    private _class: IConcreteConstructor<T> | undefined;
    private _scope: Scope;
    private _instance: T | undefined;

    constructor(private _token: string, private _callback: Function, providerClass?: Class<T>) {
        this._scope = Scope.TRANSIENT;
        if(providerClass !== undefined)
            this._class = providerClass as unknown as IConcreteConstructor<T>;
    }

    public to<E extends T>(provider: IConcreteConstructor<E>): Bind<T> {
        if(provider === undefined)
            throw new Error(`Invalid provider given!`);
        this._class = provider as unknown as IConcreteConstructor<T>;
        this._callback(this._token, this);
        return this;
    }

    public toSelf(): Bind<T> {
        if(this._class === undefined)
            throw new Error(`Invalid provider given!`);
        this._callback(this._token, this);
        return this;
    }

    public scope(scope: Scope): Bind<T> {
        if(scope === undefined)
            throw new Error(`Invalid scope given!`);
        this._scope = scope;
        this._callback(this._token, this);
        return this;
    }

    public asSingleton(): Bind<T> {
        this._scope = Scope.SINGLETON;
        this._callback(this._token, this);
        return this;
    }

    public asTransient(): Bind<T> {
        this._scope = Scope.TRANSIENT;
        this._callback(this._token, this);
        return this;
    }

    public resolve(argumentBuilder: (type: IConcreteConstructor<T>) => any[]): T | undefined {
        if(this._class === undefined)
            throw new Error(`Invalid class given! '${this._token} has no class provider!`);

        if(this._scope === Scope.SINGLETON) {
            if(this._instance === undefined) {
                const args: any[] = argumentBuilder(this._class);
                this._instance = new this._class(...args);
            }
            return this._instance;
        } else if(this._scope === Scope.TRANSIENT) {
            const args: any[] = argumentBuilder(this._class);
            return new this._class(...args);
        }
        return undefined;
    }

}


export class Container {


    private _registry: Map<string, Bind<any>>;

    constructor() {
        this._registry = new Map<string, Bind<any>>();
    }

    public register<T>(token: string | symbol | Class<T>): Bind<T> {
        if(token === undefined)
            throw new Error(`Invalid symbol given!`);
        const generatedToken: string = this.makeToken<T>(token);
        if(this._registry.get(generatedToken) !== undefined)
            throw new Error(`'${generatedToken}' is already registered!`);
        return new Bind<T>(generatedToken, (_token: string, _bind: Bind<T>) => this._registry.set(_token, _bind), (typeof(token) === 'function' ? token : undefined));
    }

    public unregister<T>(token: string | symbol | Class<T>): void {
        if(token === undefined)
            throw new Error(`Invalid symbol given!`);
        const generatedToken: string = this.makeToken<T>(token);
        if(this._registry.get(generatedToken) === undefined)
            throw new Error(`'${generatedToken}' is already registered!`);
        this._registry.delete(generatedToken);
    }

    public resolve<T>(token: string | symbol | Class<T>): T {
        const generatedToken: string = this.makeToken<T>(token);
        const bind: Bind<T> | undefined = this._registry.get(generatedToken);
        if(bind === undefined)
            throw new Error(`There is no provider definition for '${generatedToken}'`);
        const provider: T | undefined = bind.resolve((type) => this.resolveArguments(type));
        if(provider === undefined)
            throw new Error(`Unable to resolve '${generatedToken}'!`);
        return provider;
    }

    public merge(copy: Container): Container {
        let container: Container = new Container();
        const registry = new Map<string, Bind<any>>(this._registry);
        copy.getRegistry().forEach((value: Bind<any>, key: string) => {
            registry.set(key, value);
        });
        container['_registry'] = registry;
        return container;
    }

    private resolveArguments<T>(type: IConcreteConstructor<T>): any[] {
        const paramTypes: any[] = Reflect.getMetadata("design:paramtypes", type);
        if (paramTypes == undefined) {
            return [];
        }
        paramTypes.forEach(x => {
            if(!Reflect.getMetadata("DI:Injectable", x.prototype))
                throw new Error(`'${x.name}' is not injectable!`);
        });
        return paramTypes.map((x) => this.resolve(x));
    }

    private makeToken<T>(token: string | symbol | Class<T>): string {
        let registerToken: string;
        if(typeof(token) === 'string')
            registerToken = token;
        else if(typeof(token) === 'symbol') {
            if(token.description === undefined)
                throw new Error('Invalid symbol provided!');
            registerToken = token.description;
        } else
            registerToken = token.name;
        return registerToken;
    }


    // Getters & Setters

    public getRegistry(): Map<string, Bind<any>> { return new Map(this._registry); }

}