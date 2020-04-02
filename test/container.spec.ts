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

    describe('Ioc', () => {
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
            class Bar{}

            @Service()
            class Foo {
                constructor(public bar: Bar) {
                }
            }

            expect(ioc.make<Foo>(Foo, [], false).bar).toEqual(new Bar());
        });

        it('Make binding', async () => {
            class Bar{}

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

    describe('Ioc | Lookup', () => {
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

    describe('Ioc | Autoload resolve', () => {
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

    describe('Ioc | With', () => {
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
});