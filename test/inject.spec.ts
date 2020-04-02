/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/21/2020
 * Time: 2:00 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import 'reflect-metadata';
import { Application } from '../src/Foundation';
import { Injector } from '../src/Container';
import { Service } from '../src';
import { Inject } from '../src/Decorators/Inject';

describe('Inject', () => {
    it('should inject service into class property', async () => {
        const app = new Application();
        const injector = new Injector(app);

        @Service()
        class TestService {
        }

        @Service()
        class SecondTestService {
            @Inject()
            testService: TestService;
        }

        expect(injector.injectDependencies<SecondTestService>(SecondTestService).testService).toBeInstanceOf(TestService);
    });

    it('should inject interface service properly', async () => {
        const app = new Application();
        const injector = new Injector(app);

        class ServiceInterface {

        }

        @Service()
        class TestService {
        }

        @Service()
        class SecondTestService {
            @Inject(ServiceInterface)
            testService: TestService;
        }

        app.singleton(ServiceInterface, TestService);

        expect(injector.injectDependencies<SecondTestService>(SecondTestService).testService).toBeInstanceOf(TestService);
    });

    it('should inject named service into class property', async () => {
        const app = new Application();
        const injector = new Injector(app);

        class ServiceInterface {

        }

        @Service()
        class TestService {
        }

        @Service()
        class SecondTestService {
            @Inject('ServiceInterface')
            testService: TestService;
        }

        app.singleton('ServiceInterface', TestService);

        expect(injector.injectDependencies<SecondTestService>(SecondTestService).testService).toBeInstanceOf(TestService);
    });

    it('should inject service via constructor', async () => {
        const app = new Application();
        const injector = new Injector(app);

        @Service()
        class TestService {
        }

        @Service()
        class SecondTestService {
        }

        @Service()
        class NamedService {
        }

        @Service()
        class TestServiceWithParameters {
            constructor(
                public testClass: TestService,
                @Inject(type => SecondTestService) public secondTest: any,
                @Inject('mega.service') public megaService: any
            ) {
            }
        }

        app.singleton('mega.service', NamedService);

        const service = injector.injectDependencies<TestServiceWithParameters>(TestServiceWithParameters);

        expect(service.megaService).toBeInstanceOf(NamedService);
        expect(service.secondTest).toBeInstanceOf(SecondTestService);
        expect(service.testClass).toBeInstanceOf(TestService);
    });

    it('should inject service via method', async () => {
        const app = new Application();
        const injector = new Injector(app);

        @Service()
        class TestService {
        }

        @Service()
        class SecondTestService {
        }

        @Service()
        class NamedService {
        }

        @Service()
        class TestServiceWithParameters {
            megaService: any;

            secondTest: any;

            testClass: any;

            testMethod(
                testClass: TestService,
                @Inject(type => SecondTestService) secondTest: any,
                @Inject('mega.service') megaService: any
            ) {
                this.testClass = testClass;
                this.secondTest = secondTest;
                this.megaService = megaService;
            }
        }

        app.singleton('mega.service', NamedService);

        const service = injector.injectDependencies<TestServiceWithParameters>(TestServiceWithParameters);
        injector.injectMethodDependencies(TestServiceWithParameters.prototype, 'testMethod');

        expect(service.megaService).toBeInstanceOf(NamedService);
        expect(service.secondTest).toBeInstanceOf(SecondTestService);
        expect(service.testClass).toBeInstanceOf(TestService);
    });

    it('should inject service via constructor and add args', async () => {
        const app = new Application();
        const injector = new Injector(app);

        @Service()
        class TestService {
        }

        @Service()
        class SecondTestService {
        }

        @Service()
        class NamedService {
        }

        @Service()
        class TestServiceWithParameters {
            constructor(public app: any, public kernel: any, @Inject('db') public db: any) {
            }
        }

        app.singleton('db', NamedService);

        const service: TestServiceWithParameters = app.make(TestServiceWithParameters, [app, {}]);

        expect(service.app).toBeInstanceOf(Application);
        expect(service.kernel).toEqual({});
        expect(service.db).toBeInstanceOf(NamedService);
    });

    it('Token service iDs in global container aren\'t inherited by scoped containers', async () => {
        let poloCounter = 0;

        abstract class FooService {
            marco() {
            };
        }

        @Service()
        class FooServiceI implements FooService {
            public marco() {
                poloCounter++;
            }
        }

        const app = new Application();
        const injector = new Injector(app);

        app.bind(FooService, FooServiceI);

        app.use<FooService>(FooService).marco();
        app.use<FooService>(FooService).marco();
        expect(poloCounter).toBe(2);
    });

    describe('Exception not thrown on missing binding', () => {
        it("should work properly", function() {

            const app = new Application();
            const injector = new Injector(app);

            interface Factory {
                create(): void;
            }

            @Service()
            class CoffeeMaker {

                @Inject() // This is an incorrect usage of typedi because Factory is an interface
                private factory: Factory;

                make() {
                    this.factory.create();
                }

            }

            expect(() => {
                injector.injectDependencies(CoffeeMaker);
            }).toThrow(Error);
        });
    });
});