/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/10/2020
 * Time: 5:31 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import 'reflect-metadata';
import { Injector } from '../src/Container/Injector';
import { Container } from '../src/Container/Container';
import { Service } from '../src/Decorators/Service';
import { Application } from '../src/Foundation';
import { Inject } from '../src/Decorators/Inject';

describe('Injector', () => {
    let injector: Injector;
    let app: Container;

    beforeAll(async () => {
        app = Container.getInstance();
        injector = new Injector(app);
    });

    it('resolve', async () => {
        class Bar {
        }

        @Service()
        class Foo {
            constructor(public bar: Bar) {
            }
        }

        expect(injector.injectDependencies<Foo>(Foo).bar).toEqual(new Bar());
    });

    it('Resolve binding', async () => {
        class Bar {
        }

        @Service()
        class Foo {
            constructor(public bar: Bar) {
            }
        }

        app.bind(Bar, () => {
            return 'bar';
        });

        expect(injector.injectDependencies<Foo>(Foo).bar).toBe('bar');
    });

    it('Injector Dependencies @inject namespace', async () => {
        const app = new Application();
        const injector = new Injector(app);

        class Bar {
        }

        app.singleton('bar', Bar);

        @Service()
        class Foo {
            constructor(@Inject('bar') public bar: Bar) {
            }

            name(@Inject('bar') bar: Bar) {
                return bar;
            }
        }

        const foo = app.make<Foo>(Foo);

        expect(foo.bar).toBeInstanceOf(Bar);
        expect(app.call(foo, 'name')).toBeInstanceOf(Bar);
    });

    it('Injector Dependencies @inject class interface', async () => {
        const app = new Application();
        const injector = new Injector(app);

        class BarInterface {

        }

        class Bar implements BarInterface {
        }

        app.singleton(BarInterface, Bar);

        @Service()
        class Foo {
            constructor(@Inject(BarInterface) public bar: Bar) {
            }

            name(@Inject(BarInterface) bar: BarInterface) {
                return bar;
            }

            @Inject(BarInterface)
            nguyen: any;

            @Inject()
            bar3: BarInterface
        }

        const foo = app.make<Foo>(Foo);

        expect(foo.bar).toBeInstanceOf(Bar);
        expect(app.call(foo, 'name')).toBeInstanceOf(Bar);
        expect(foo.nguyen).toBeInstanceOf(Bar);
        expect(foo.bar3).toBeInstanceOf(Bar);
    });
});