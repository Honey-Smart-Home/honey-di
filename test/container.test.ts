import { Container, Injectable, SupportsInjection } from "../src";



interface ILogger {
    log(msg: string): string;
    info(msg: string): string;
    error(msg: string): string;
}

class ConsoleLogger implements ILogger {
    public log(msg: string): string { return msg; }
    public info(msg: string): string { return this.log(`[INFO] ${msg}`); }
    public error(msg: string): string { return this.log(`[ERROR] ${msg}`); }
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

@Injectable()
class UserService {

    public getUsers(): object {
        return { 'drischdaan': { id: 3, name: 'Drischdaan', role: 'Admin' } };
    }

}

@SupportsInjection()
class UserController {

    constructor(public userService: UserService) {}

    public onGetUsers(): object { return this.userService.getUsers(); }

}




describe('Container', () => {

    const container: Container = new Container();
    const container2: Container = new Container();

    test('Interface resolving', () => {
        container.register<ILogger>(Symbol.for('ILogger')).to<ConsoleLogger>(ConsoleLogger);

        const logger: ILogger = container.resolve<ILogger>(Symbol.for('ILogger'));
        const testMessage: string = 'This is a test message!';

        expect(logger).toEqual(new ConsoleLogger());
        expect(logger.log(testMessage)).toEqual(testMessage);
        expect(logger.info(testMessage)).toEqual(`[INFO] ${testMessage}`);
        expect(logger.error(testMessage)).toEqual(`[ERROR] ${testMessage}`);

        container.unregister<ILogger>(Symbol.for('ILogger'));
    });

    test('Abstract class resolving', () => {
        container.register<Car>(Car).to<MercedesCar>(MercedesCar);

        const car: Car = container.resolve<Car>(Car);
        expect(car).toEqual(new MercedesCar());
        expect(car.name).toEqual(new MercedesCar().name);
        expect(car.getSpecs()).toEqual(new MercedesCar().getSpecs());

        container.unregister<Car>(Car);
    });

    test('Singleton & Transient', () => {
        container.register<MathUtils>(MathUtils).toSelf().asSingleton();

        let mathUtils1: MathUtils = container.resolve<MathUtils>(MathUtils);
        let mathUtils2: MathUtils = container.resolve<MathUtils>(MathUtils);

        expect(mathUtils1.randomNumber).toEqual(mathUtils2.randomNumber);

        container.unregister<MathUtils>(MathUtils);
        container.register<MathUtils>(MathUtils).toSelf();

        mathUtils1 = container.resolve<MathUtils>(MathUtils);
        mathUtils2 = container.resolve<MathUtils>(MathUtils);

        expect(mathUtils1.randomNumber).not.toEqual(mathUtils2.randomNumber);

        container.unregister<MathUtils>(MathUtils);
    });

    test('Provider injection', () => {
        container.register<UserService>(UserService).toSelf();
        container.register<UserController>(UserController).toSelf();

        const userController: UserController = container.resolve<UserController>(UserController);

        expect(userController.userService).toBeDefined();
        expect(userController.onGetUsers()).toEqual(new UserService().getUsers());

        container.unregister<UserService>(UserService);
        container.unregister<UserController>(UserController);
    });

    test('Container merging', () => {
        container.register<UserController>(UserController).toSelf();
        container2.register<UserService>(UserService).toSelf();

        expect(container.getRegistry().size).toEqual(1);

        const merged: Container = container.merge(container2);

        expect(merged.getRegistry().size).toEqual(2);

        const userController: UserController = merged.resolve<UserController>(UserController);

        expect(userController.userService).toBeDefined();
        expect(userController.onGetUsers()).toEqual(new UserService().getUsers());

        container2.unregister<UserService>(UserService);
        container.unregister<UserController>(UserController);
        merged.unregister<UserService>(UserService);
        merged.unregister<UserController>(UserController);
    });

});
