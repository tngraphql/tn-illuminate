/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/10/2020
 * Time: 10:16 AM
 */

import { Container } from '../src/Container/Container';
import { join } from 'path';
import { Filesystem } from '@poppinss/dev-utils/build';
import { Service } from '../src/Decorators/Service';
import { Inject } from '../src/Decorators';

const fs = new Filesystem(join(__dirname, './app'));

describe('Container', () => {
    afterEach(async () => {
        jest.resetModules();
        await fs.cleanup();
    });

    describe('Singleton pattern', () => {
        it('Automatically created instance', async () => {
            Container.instance = undefined;
            const app = Container.getInstance();
            expect(app instanceof Container).toBe(true);
            expect(app).toBe(Container.getInstance());
        });

        it('Make sure that only one version is created', async () => {
            const app = Container.setInstance(new Container());
            expect(app instanceof Container).toBe(true);
            expect(app).toBe(Container.getInstance());
        });
    });

    describe('Container', () => {
        let ioc: Container;

        beforeAll(async () => {
            ioc = Container.getInstance();
        });

        afterEach(async () => {
            ioc.flush();
            jest.resetModules()
            await fs.cleanup();
        });

        it('raise error when bind callback is not a function', async () => {
            expect.assertions(1);

            try {
                (ioc as any).bind('App/Foo', 'hello');
            } catch (e) {
                expect(e.message).toEqual('E_RUNTIME_EXCEPTION: ioc.bind expect 2nd argument to be a function');
            }
        });
        it('raise error when bind namespace is undefine', async () => {
            expect.assertions(1);

            try {
                (ioc as any).bind(null, 'hello');
            } catch (e) {
                expect(e.message).toEqual('Empty namespace cannot be used as IoC container reference');
            }
        });


        it('bind value to the container', async () => {
            class Bar {
            }

            class Token {
            }

            ioc.bind('App/Foo', () => {
                return 'foo'
            });
            ioc.bind('App/Bar', Bar);
            ioc.bind(Bar, Bar);
            ioc.bind(Token, () => {
                return 'token';
            });

            expect(ioc.use('App/Foo')).toBe('foo');
            expect(ioc.use('App/Bar')).toEqual(new Bar());
            expect(ioc.use(Bar)).toEqual(new Bar());
            expect(ioc.use(Token)).toBe('token');
        });

        it('compute value everytime use is called', async () => {
            ioc.bind('App/Foo', () => {
                return Symbol('foo')
            })

            expect(ioc.use('App/Foo')).not.toEqual(ioc.use('App/Foo'));
        });

        it('do not compute value everytime when binded as singleton', async () => {
            ioc.singleton('App/Foo', () => {
                return Symbol('foo')
            })

            expect(ioc.use('App/Foo')).toEqual(ioc.use('App/Foo'));
        })

        it('define alias for a binding', async () => {
            ioc.bind('App/Foo', () => {
                return 'foo'
            })

            ioc.alias('App/Foo', 'foo');

            expect(ioc.use('foo')).toEqual('foo');
        });

        it('define alias tree for a binding', async () => {
            ioc.bind('App/Foo', () => {
                return 'foo'
            })

            ioc.alias('App/Foo', 'foo');
            ioc.alias('foo', 'bar');

            expect(ioc.use('bar')).toEqual('foo');
        });

        it('return true from hasBinding when it exists', async () => {
            ioc.bind('App/Foo', () => {
                return { foo: true }
            })

            ioc.alias('App/Foo', 'Foo');
            ioc.alias('Foo', 'Bar');

            expect(ioc.hasBinding('App/Foo')).toEqual(true);
            expect(ioc.hasBinding('Foo')).toEqual(false);
            expect(ioc.hasBinding('Foo', true)).toEqual(true);

            expect(ioc.hasBinding('Bar')).toEqual(false);
            expect(ioc.hasBinding('Bar', true)).toEqual(true);
        });

        it('return true from hasAlias when it exists', async () => {
            ioc.bind('App/Foo', () => {
                return { foo: true }
            });

            ioc.alias('App/Foo', 'Foo');
            expect(ioc.hasAlias('Foo')).toEqual(true);
            expect(ioc.hasAlias(null)).toEqual(false);
            expect((ioc as any).hasAlias(String)).toEqual(false);
        });

        it('return alias namespace if exists', async () => {
            ioc.bind('App/Foo', () => {
                return { foo: true }
            })

            ioc.alias('App/Foo', 'Foo');
            ioc.alias('Foo', 'bar');

            expect(ioc.getAliasNamespace('Bar')).toEqual('Bar');
            expect(ioc.getAliasNamespace('Foo')).toEqual('App/Foo');

            expect(ioc.getAliasNamespace('bar')).toEqual('App/Foo');
        });

        it('raise exception when unable to resolve get alias namespace', async () => {
            ioc.bind('App/Foo', () => {
                return { foo: true }
            })

            ioc.alias('App/Foo', 'Foo');
            ioc.alias('Foo', 'Foo');

            try {
                ioc.getAliasNamespace('Foo');
            } catch (e) {
                expect(e.message).toEqual(`[Foo] is aliased to itself.`)
            }
        });

        it('raise error when lookup fails', () => {
            class Foo {
            };
            try {
                ioc.use('japa');
            } catch (e) {
                expect(e.message).toEqual('Resolve [japa] does not exists.');
            }

            try {
                ioc.use(Foo);
            } catch (e) {
                expect(e.message).toEqual(`Resolve [${ Foo }] does not exists.`)
            }
        });

        it('Make inject', async () => {
            class Bar {
            }

            @Service()
            class Foo {
                constructor(public bar: Bar) {
                }
            }

            expect(ioc.make<Foo>(Foo, [], false).bar).toEqual(new Bar());
        });

        it('Make binding', async () => {
            class Bar {
            }

            @Service()
            class Foo {
                constructor(public bar: Bar) {
                }
            }

            ioc.bind(Bar, () => {
                return 'bar';
            });

            expect(ioc.make<Foo>(Foo).bar).toBe('bar');
        });
    });

    describe('Container | Lookup', () => {
        let ioc: Container;

        beforeAll(async () => {
            ioc = Container.getInstance();
        });

        afterEach(async () => {
            ioc.flush();
            jest.resetModules()
            await fs.cleanup();
        });

        it('lookup binding from namespace', async () => {
            class Foo {
            }

            ioc.bind('App/Foo', () => {
                return 'foo'
            });
            ioc.bind(Foo, Foo);

            expect(ioc.lookup('App/Foo')).toEqual({
                namespace: 'App/Foo',
                type: 'binding',
            });
            expect(ioc.lookup(Foo)).toEqual({
                namespace: Foo,
                type: 'binding',
            })
        });

        it('lookup autoload from namespace', async () => {
            ioc.autoload(fs.basePath, 'App');

            expect(ioc.lookup('App/Foo')).toEqual({
                namespace: 'App/Foo',
                type: 'autoload',
            });
        });

        it('raise exception when unable to resolve lookup namespace', async () => {
            try {
                ioc.lookup(null);
            } catch (e) {
                expect(e.message).toEqual('Empty key cannot be used as IoC container reference');
            }
        });
    });

    describe('Container | Autoload resolve', () => {
        let ioc: Container;

        beforeAll(async () => {
            ioc = Container.getInstance();
        });

        afterEach(async () => {
            jest.resetModules();
            ioc.flush();
            await fs.cleanup();
        });

        it('lookup autoload value', async () => {
            await fs.add('Foo2.js', 'module.exports = \'bar\'')

            ioc.autoload(fs.basePath, 'App')

            expect(ioc.use('App/Foo2')).toEqual('bar');
            expect(ioc.use('App/Foo2')).toEqual('bar');
        });

        it('autoload esm module', async () => {
            await fs.add('Foo3.js', `
                module.exports = class A {}
            `)

            ioc.autoload(fs.basePath, 'App');

            expect(ioc.make('App/Foo3')).toEqual({});
        });

        it('autoload export module', async () => {
            await fs.add('Foo4.ts', `
                export class Foo4 {}
            `)

            ioc.autoload(fs.basePath, 'App');

            expect(ioc.make('App/Foo4')).toEqual({});
        });

        it('autoload export = module', async () => {
            await fs.add('Foo5.ts', `
                class Foo5 {}
                export = Foo5;
            `)

            ioc.autoload(fs.basePath, 'App');

            expect(ioc.make('App/Foo5')).toEqual({});
        });

        it('autoload export default module', async () => {
            await fs.add('Foo6.ts', `
                export default class Foo6 {}
            `)

            ioc.autoload(fs.basePath, 'App');

            expect(ioc.make('App/Foo6')).toEqual({});
        });

        it('raise exception when unable to resolve lookup namespace', async () => {
            expect.assertions(1);

            await fs.add('Foo.js', 'module.exports = \'bar\'')

            ioc.autoload(fs.basePath, 'App')
            try {
                ioc.resolve({
                    namespace: 'App/Foo',
                    type: 'binding'
                }, []);
            } catch (e) {
                expect(e.message).toEqual(`Cannot resolve App/Foo binding from the IoC Container`)
            }
        });
    });

    describe('Container | With', () => {
        let ioc: Container;

        beforeAll(async () => {
            ioc = Container.getInstance();
        });

        afterEach(async () => {
            ioc.flush();
            jest.resetModules()
            await fs.cleanup();
        });

        it('execute the callback when all bindings exists', async () => {
            expect.assertions(2);

            ioc.bind('App/Foo', () => {
                return 'foo'
            })

            ioc.bind('App/Bar', () => {
                return 'bar'
            })

            ioc.with(['App/Foo', 'App/Bar'], (foo, bar) => {
                expect(foo).toEqual('foo');
                expect(bar).toEqual('bar');
            })
        });

        it('do not execute the callback if any bindings is missing', async () => {
            ioc.bind('App/Foo', () => {
                return 'foo'
            })

            ioc.with(['App/Foo', 'App/Bar'], () => {
                throw new Error('Never expected to be called')
            })
        });
    });

    describe('Container | Make', () => {
        beforeEach(() => {
            Container.instance = undefined;
        });

        it('make instance of a class', async () => {
            const app = Container.getInstance();

            class Foo {
            }

            expect(app.make(Foo)).toBeInstanceOf(Foo);
        });

        it('make instance of a class and inject dependencies', async () => {
            const ioc = Container.getInstance();

            @Service()
            class Foo {
                constructor(@Inject('App/Bar') public bar: any) {
                }
            }

            class Bar {
            }

            ioc.bind('App/Bar', () => {
                return new Bar()
            });

            expect(ioc.make(Foo).bar).toBeInstanceOf(Bar);
        });

        it('do not make instance when namespace is a binding', async () => {
            const ioc: Container = Container.getInstance();

            class BarFactory {}
            class Bar {
            }

            ioc.bind('App/Bar', () => {
                return Bar
            });
            ioc.bind(BarFactory, () => {
                return Bar;
            });

            expect(ioc.make('App/Bar')).toBe(Bar);
            expect(ioc.make(BarFactory)).toBe(Bar);
        });

        it('do not make instance when namespace is an alias', async () => {
            const ioc: Container = Container.getInstance();

            class Bar {
            }

            ioc.bind('App/Bar', () => {
                return Bar
            })

            ioc.alias('App/Bar', 'Bar')

            expect(ioc.make('Bar')).toBe(Bar);
        });

        it('make instance when namespace is part of autoload', async () => {
            await fs.add('Foo.js', `module.exports = class Foo {
      constructor () {
        this.name = 'foo'
      }
    }`)
            const ioc: Container = Container.getInstance();
            ioc.autoload(join(fs.basePath), 'Admin');

            expect(ioc.make<any>('Admin/Foo').name).toEqual('foo');
        });

        it('work fine with esm export default', async () => {
            await fs.add('Bar.ts', `export default class Bar {
      public name = 'bar'
    }`);
            const ioc: Container = Container.getInstance();
            ioc.autoload(fs.basePath, 'App')
            expect((ioc.make('App/Bar') as any).name).toBe('bar');
        });

        it('make esm named exports', async () => {
            await fs.add('Bar.ts', `export class Bar {
      public name = 'bar'
    }`);
            const ioc: Container = Container.getInstance();
            ioc.autoload(fs.basePath, 'App')
            expect((ioc.make('App/Bar') as any).name).toBe('bar');
        });

        it('do not make esm not named exports', async () => {
            await fs.add('Bar.ts', `export class Foo {
      public name = 'bar'
    }`);
            const ioc: Container = Container.getInstance();
            ioc.autoload(fs.basePath, 'App')

            expect((ioc.make('App/Bar') as any).Foo.name).toBe('Foo');
        });

        it('wrap make output object to proxy', async () => {
            await fs.add('Bar.ts', `export default class Bar {
      public name = 'bar'
    }`)

            const ioc: Container = Container.getInstance();
            ioc.autoload(fs.basePath, 'App')
            ioc.useProxies()

            class FakeBar {
                public name: string

                constructor(originalName: string) {
                    this.name = `fake${ originalName }`
                }
            }

            ioc.fake('App/Bar', (_container, user) => {
                return new FakeBar(user.name)
            });


            expect(ioc.make<FakeBar>('App/Bar').name).toBe('fakebar');
        });

        it('wrap esm named modules to proxy', async () => {
            await fs.add('Bar.ts', `export class Bar {
      public name = 'bar'
    }`)

            const ioc: Container = Container.getInstance();
            ioc.autoload(fs.basePath, 'App')
            ioc.useProxies()

            class FakeBar {
                public name: string

                constructor(originalName: string) {
                    this.name = `fake${ originalName }`
                }
            }

            ioc.fake('App/Bar', (_container, user) => {
                return new FakeBar(user.name)
            });

            expect(ioc.make<FakeBar>('App/Bar').name).toBe('fakebar')
        });

        it('do not wrap esm not named modules to proxy', async () => {
            await fs.add('Bar.ts', `export class Foo {
      public name = 'bar'
    }`)

            const ioc: Container = Container.getInstance();
            ioc.autoload(fs.basePath, 'App')
            ioc.useProxies()

            class FakeBar {
                public name: string

                constructor(originalName: string) {
                    this.name = `fake${ originalName }`
                }
            }

            ioc.fake('App/Bar', (_container, user) => {
                return new FakeBar(user.name)
            });

            expect(ioc.make<any>('App/Bar').Foo.name).toBe('Foo')
        });
    });

    describe('Container | Fake', () => {
        beforeEach(() => {
            Container.instance = undefined;
        });

        it('ensure proxy traps works fine on class instance', async () => {
            class Foo {
                public name = 'foo'

                public getName() {
                    return this.name
                }
            }

            const ioc: Container = Container.getInstance();
            ioc.useProxies()
            ioc.bind('App/Foo', () => {
                return new Foo()
            })

            const value = ioc.use<any>('App/Foo');
            expect(value.name).toBe('foo');
            expect(value.getName()).toBe('foo');
            expect(value.nonProp).toBeUndefined();
            value.nonProp = true;
            expect(value.nonProp).toBeTruthy();
            expect(value.constructor.name).toBe('Foo');
            expect(Object.getOwnPropertyNames(Object.getPrototypeOf(value))).toEqual(['constructor', 'getName']);
        });

        it('ensure proxy traps works fine with fakes', async () => {
            class Foo {
                public name = 'foo'

                public getName() {
                    return this.name
                }

                public invoke(...args) {
                    return args.concat(['real'])
                }
            }

            class FooFake {
                public name = 'foofake'

                public getName() {
                    return this.name
                }
            }

            const ioc: Container = Container.getInstance();
            ioc.bind('App/Foo', () => {
                return new Foo()
            })
            ioc.useProxies()

            const value = ioc.use<any>('App/Foo')

            /**
             * Trap get
             */
            expect(value.name).toBe('foo');

            /**
             * Trap get (hold scope)
             */
            expect(value.getName()).toBe('foo');

            /**
             * Trap get (reflect truth)
             */
            expect(value.nonProp).toBeUndefined();

            /**
             * Trap set
             */
            value.nonProp = true
            expect(value.nonProp).toBeTruthy();

            /**
             * Trap get constructor
             */
            expect(value.constructor.name).toBe('Foo');

            /**
             * Trap getPrototypeOf
             */
            expect(Object.getOwnPropertyNames(Object.getPrototypeOf(value))).toEqual(['constructor', 'getName', 'invoke']);

            /**
             * Trap ownKeys
             */
            expect(Object.getOwnPropertyNames(value)).toEqual(['name', 'nonProp']);

            /**
             * Trap isExtensible
             */
            expect(Object.isExtensible(value)).toBeTruthy();

            /**
             * Trap deleteProperty
             */
            delete value.nonProp
            expect(value.nonProp).toBeUndefined()

            /**
             * Trap has
             */
            expect('name' in value).toBeTruthy();
            expect('nonProp' in value).toBeFalsy();

            /**
             * Trap setPrototypeOf
             */
            Object.setPrototypeOf(value, {
                getName() {
                    return 'proto name'
                },
            })
            expect(value.getName()).toBe('proto name');
            Object.setPrototypeOf(value, Foo.prototype)
            expect(value.getName()).toBe('foo');

            /**
             * Trap preventExtensions
             */
            const fn = () => Object.preventExtensions(value)
            expect(fn).toThrow('Cannot prevent extensions during a fake');

            ioc.fake('App/Foo', () => {
                return new FooFake()
            })

            /**
             * Trap get
             */
            expect(value.name).toBe('foofake')

            /**
             * Trap get (hold scope)
             */
            expect(value.getName()).toBe('foofake');

            /**
             * Trap get (reflect truth)
             */
            expect(value.nonProp).toBeUndefined()

            /**
             * Trap set
             */
            value.nonProp = true
            expect(value.nonProp).toBeTruthy()

            /**
             * Trap get constructor
             */
            expect(value.constructor.name).toBe('FooFake');

            /**
             * Trap getPrototypeOf
             */
            expect(Object.getOwnPropertyNames(Object.getPrototypeOf(value))).toEqual(['constructor', 'getName']);

            /**
             * Trap ownKeys
             */
            expect(Object.getOwnPropertyNames(value)).toEqual(['name', 'nonProp']);

            /**
             * Trap isExtensible
             */
            expect(Object.isExtensible(value)).toBeTruthy();

            /**
             * Trap deleteProperty
             */
            delete value.nonProp
            expect(value.nonProp).toBeUndefined();

            /**
             * Trap has
             */
            expect('name' in value).toBeTruthy();
            expect('nonProp' in value).toBeFalsy();

            /**
             * Trap setPrototypeOf
             */
            Object.setPrototypeOf(value, {
                getName() {
                    return 'proto name'
                },
            })
            expect(value.getName()).toBe('proto name');
            Object.setPrototypeOf(value, Foo.prototype)
            expect(value.getName()).toBe('foofake');

            /**
             * Trap preventExtensions
             */
            const fn1 = () => Object.preventExtensions(value)
            expect(fn1).toThrow('Cannot prevent extensions during a fake');
        });

        it('ensure proxy traps works fine when fake has been restored', async () => {
            class Foo {
                public name = 'foo'

                public getName() {
                    return this.name
                }
            }

            class FooFake {
                public name = 'foofake'

                public getName() {
                    return this.name
                }
            }

            const ioc: Container = Container.getInstance();
            ioc.useProxies()
            ioc.bind('App/Foo', () => {
                return new Foo()
            })

            const value = ioc.use<any>('App/Foo')

            expect(value.name).toBe('foo');
            expect(value.getName()).toBe('foo');
            expect(value.nonProp).toBeUndefined();
            value.nonProp = true

            expect(value.nonProp).toBeTruthy();
            expect(value.constructor.name).toBe('Foo');
            expect(Object.getOwnPropertyNames(Object.getPrototypeOf(value))).toEqual(['constructor', 'getName']);

            // Fake added
            ioc.fake('App/Foo', () => {
                return new FooFake()
            })

            expect(value.name).toBe('foofake');
            expect(value.getName()).toBe('foofake');
            expect(value.nonProp).toBeUndefined();

            value.nonProp = true

            expect(value.nonProp).toBeTruthy();
            expect(value.constructor.name).toBe('FooFake');
            expect(Object.getOwnPropertyNames(Object.getPrototypeOf(value))).toEqual(['constructor', 'getName']);

            // Fake restored
            ioc.restore('App/Foo')

            expect(value.name).toBe('foo');
            expect(value.getName()).toBe('foo');
            expect(value.constructor.name).toBe('Foo');
            expect(Object.getOwnPropertyNames(Object.getPrototypeOf(value))).toEqual(['constructor', 'getName']);
        });

        it('proxy class constructor', async () => {
            interface FooConstructor {
                new (): Foo
            }

            class Foo {
                public name = 'foo'

                public getName () {
                    return this.name
                }
            }

            class FooFake {
                public name = 'foofake'

                public getName () {
                    return this.name
                }
            }

            const ioc: Container = Container.getInstance();
            ioc.useProxies()
            ioc.bind('App/Foo', () => {
                return Foo
            })

            const value = ioc.use<FooConstructor>('App/Foo')
            expect(new value()).toBeInstanceOf(Foo);

            ioc.fake('App/Foo', () => {
                return FooFake
            })
            expect(new value()).toBeInstanceOf(FooFake);
        });

        it('proxy class constructor via ioc.make', async () => {
            interface FooConstructor {
                new (): Foo
            }

            class Foo {
                public name = 'foo'

                public getName () {
                    return this.name
                }
            }

            class FooFake {
                public name = 'foofake'

                public getName () {
                    return this.name
                }
            }

            const ioc: Container = Container.getInstance();
            ioc.useProxies()
            ioc.bind('App/Foo', () => {
                return Foo
            })

            const value = ioc.make<FooConstructor>('App/Foo')
            expect(new value()).toBeInstanceOf(Foo);

            ioc.fake('App/Foo', () => {
                return FooFake
            })
            expect(new value()).toBeInstanceOf(FooFake);
        });

        it('do not proxy literals when using ioc.make', async () => {
            const ioc: Container = Container.getInstance();
            ioc.useProxies()
            ioc.bind('App/Foo', () => {
                return 'foo'
            })

            const value = ioc.make('App/Foo')
            expect(value).toBe('foo');

            ioc.fake('App/Foo', () => {
                return 'fakefake'
            })

            expect(value).toBe('foo');
        });

        it('do not proxy literals when using ioc.use', async () => {
            const ioc: Container = Container.getInstance();
            ioc.useProxies()
            ioc.bind('App/Foo', () => {
                return 'foo'
            })

            const value = ioc.use('App/Foo')
            expect(value).toBe('foo');

            ioc.fake('App/Foo', () => {
                return 'fakefake'
            })

            expect(value).toBe('foo');
        });

        it('proxy autoloaded class using use', async () => {
            await fs.add('Bar.ts', `export = class Bar {
      public name = 'bar'
    }`)

            const ioc: Container = Container.getInstance();
            ioc.autoload(fs.basePath, 'App')

            class BarFake {
                public name = 'barfake'

                public getName () {
                    return this.name
                }
            }

            ioc.useProxies()

            const value: any = ioc.use('App/Bar')
            expect(new (value)().name).toBe('bar');

            ioc.fake('App/Bar', () => {
                return BarFake
            })

            expect(new (value)().name).toBe('barfake');
        });

        it('proxy bindings using use', async () => {
            const ioc: Container = Container.getInstance();
            ioc.bind('App/Bar', () => {
                class Bar {
                    public name = 'bar'
                }

                return Bar
            })

            class FooFake {
                public name = 'foofake'

                public getName () {
                    return this.name
                }
            }

            ioc.useProxies()

            const value: any = ioc.use('App/Bar')
            expect(new (value)().name).toBe('bar');

            ioc.fake('App/Bar', () => {
                return FooFake
            })

            expect(new (value)().name).toBe('foofake');
        });

        it('proxy bindings using use, when namespace is Object|Function', async () => {
            const ioc: Container = Container.getInstance();
            class BarFactory{}
            ioc.bind(BarFactory, () => {
                class Bar {
                    public name = 'bar'
                }

                return Bar
            })

            class FooFake {
                public name = 'foofake'

                public getName () {
                    return this.name
                }
            }

            ioc.useProxies()

            const value: any = ioc.use(BarFactory)
            expect(new (value)().name).toBe('bar');

            ioc.fake(BarFactory, () => {
                return FooFake
            })

            expect(new (value)().name).toBe('foofake');
        });

        it('proxy autoloaded class using make', async () => {
            await fs.add('Bar.ts', `export default class Bar {
      public name = 'bar'
    }`)

            const ioc: Container = Container.getInstance();
            ioc.autoload(fs.basePath, 'App')

            class BarFake {
                public name = 'barfake'

                public getName () {
                    return this.name
                }
            }

            ioc.useProxies()

            const value = ioc.make<any>('App/Bar')
            expect(value.name).toBe('bar');

            ioc.fake('App/Bar', () => {
                return new BarFake()
            })

            expect(value.name).toBe('barfake');
        });

        it('proxy bindings using make', async () => {
            class Foo {
                public name = 'foo'

                public getName () {
                    return this.name
                }
            }

            class FooFake {
                public name = 'foofake'

                public getName () {
                    return this.name
                }
            }

            const ioc: Container = Container.getInstance();
            ioc.useProxies()
            ioc.bind('App/Foo', () => {
                return new Foo()
            })

            const value = ioc.make<Foo>('App/Foo')
            expect(value.name).toBe('foo');

            ioc.fake('App/Foo', () => {
                return new FooFake()
            })

            expect(value.name).toBe('foofake');
        });

        it('proxy bindings using make, when namesapce is object, function', async () => {
            class FooFactory{}
            class Foo {
                public name = 'foo'

                public getName () {
                    return this.name
                }
            }

            class FooFake {
                public name = 'foofake'

                public getName () {
                    return this.name
                }
            }

            const ioc: Container = Container.getInstance();
            ioc.useProxies()
            ioc.bind(FooFactory, () => {
                return new Foo()
            })

            const value = ioc.make<Foo>(FooFactory)
            expect(value.name).toBe('foo');

            ioc.fake(FooFactory, () => {
                return new FooFake()
            })

            expect(value.name).toBe('foofake');
        });
    });
});
