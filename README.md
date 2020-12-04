# @honey-sh/di 💉

Inversion of control system




## How to use


Example code:

```ts
import { Container, Scope } from '@honey-sh/di';


// Dummy classes / interfaces

interface ILogger {
    log(msg: string): void;
}
class ConsoleLogger {
    public log(msg: string) {
        console.log(`[Logger]: ${msg}`) ;
    }
}

abstract class Car {
    constructor(public name: string) {}
    abstract getSpecs(): any;
}
class MercedesCar extends Car {

    constructor() {
        super('A 35 4MATIC');
    }

    public getSpecs(): any {
        return { name: this.name };
    }

}

class MathUtils {
    public randomNumber: number = Math.random() * 10;
}



// Example

const container: Container = new Container();

container.register<ILogger>(Symbol.for('ILogger')).to<ConsoleLogger>(ConsoleLogger); // Interface registration
container.register<Car>(Car).to<MercedesCar>(MercedesCar); // Abstract class registration
container.register<MathUtils>(MathUtils).toSelf().scope(Scope.SINGLETON); // Self registration && Singleton registration

function testResolving() {
    const logger: ILogger = container.resolve<ILogger>(Symbol.for('ILogger')); // Resolving interfaces
    const car: Car = container.resolve<Car>(Car); // Resolving Abstract classes
    const math1: MathUtils = container.resolve<MathUtils>(MathUtils); // Resolving self registrations / normal classes
    const math2: MathUtils = container.resolve<MathUtils>(MathUtils);

    logger.log('Test output');
    console.log(car.getSpecs());
    console.log(`MathUtils1's randomNumber:`, math1.randomNumber, `| MathUtils2's randomNumber:`, math2.randomNumber);
    console.log(`Scope of MathUtils is:`, math1.randomNumber === math2.randomNumber ? 'Singleton' : 'Transient');
}
testResolving();

// Lets see what happens when we reregister MathUtils as a transient
container.unregister<MathUtils>(MathUtils);
container.register<MathUtils>(MathUtils).toSelf().scope(Scope.TRANSIENT); // Self registration && Singleton registration

testResolving();
```
