# @honey-sh/di 💉

IoC (Inversion of control) system that I developed for my smart home project. First implementation of this project was a dependency injection library, therefore the name ``di`` and not ``ioc``




## Getting Started

### Installing

Install @honey-sh/di through the package manager of your choice

    $ npm install @honey-sh/di

### Container

First of all you need to create a container where you can register your providers.

```ts
import { Container } from '@honey-sh/di';

const container: Container = new Container();
```

### Registering providers

It's very easy to add providers. I chose a describing registration, like ``register().to().as/scope()``.

#### Interfaces

To register a interface you must use either a string (the name of the interface) or ``Symbol.for('INTERFACE_NAME')`` for the token.

```ts
interface ILogger {
    log(msg: string): void;
}
class ConsoleLogger implements ILogger {
    public log(msg: string): void { console.log(`[Logger] ${msg}`); }
}

container.register<ILogger>(Symbol.for('ILogger')).to<ConsoleLogger>(ConsoleLogger);
```

#### Normal and abstract classes

To register normal or abstract classes you don't need to use Symbols. You could, but its easier to just use the class itself.

```ts
abstract class Person {
    public abstract getName(): string;
}
class Drischdaan extends Person {
    public getName(): string {
        return 'Drischdaan';
    }
}

container.register<Person>(Person).to<Drischdaan>(Drischdaan);
```

#### Self registration

You can choose to register the provider to itself and not a implementation.
You can only do that to normal classes. When you try to do that with interfaces or abstract classes it will throw an error on resolving the provider.

```ts
class StaticData{
    public appVersion: string = 'v0.0.1';
}

container.register<StaticData>(StaticData).toSelf();
```

#### Scopes

There are different scopes like singleton or transient. On default every provider gets registered as a transient. That means the class will be instantiated on every resolve.
When you register him as a singleton the class will be instantiated once and will be reused on every resolve.

```ts
import { Container, Scope } from '@honey-sh/di';

interface ILogger {
    log(msg: string): void;
}
class ConsoleLogger implements ILogger {
    public log(msg: string): void { console.log(`[Logger] ${msg}`); }
}

container.register<ILogger>(Symbol.for('ILogger')).scope(Scope.SINGLETON);
container.register<ILogger>(Symbol.for('ILogger')).asSingleton();
container.register<ILogger>(Symbol.for('ILogger')).asTransient();
```

#### Resolving providers

WIP

```ts
// Let' resolve the ILogger interface
const logger: ILogger = container.resolve<ILogger>(Symbol.for('ILogger'));

// Should print '[Logger] Test message' because of the
// implementation in the ConsoleLogger class
logger.log('Test message');
```

#### Dependency injection

WIP

```ts
@Injectable()
class UserService {
    public getUsers(): object {
        return { 'drischdaan': { id: 3, name: 'Drischdaan', role: 'Admin' } };
    }
}
@SupportsInjection()
class UserController {
    constructor(public userService: UserService) {}
    public onGetUsers(): object {
        return this.userService.getUsers();
    }
}

container.register<UserService>(UserService).toSelf();
container.register<UserController>(UserController).toSelf();

const controller: UserController = container.resolve<UserController>(UserController);
console.log(controller.onGetUsers());
```

## Support

<div>
    <a href="https://www.buymeacoffee.com/Drischdaan" target="_blank">
        <img src="https://cdn.buymeacoffee.com/buttons/v2/default-orange.png" alt="Buy Me A Coffee" height="40" width="170" />
    </a>
</div>