/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/4/2020
 * Time: 10:06 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Application } from '../src/Foundation';
import { Facade } from '../src/Support/Facade';

describe('facade', () => {

    it('facade create of binding', async () => {
        const app = new Application();
        app.bind('App/Bar', () => {
            return {
                getName() {
                    return 'bar';
                }
            }
        });

        Facade.clearResolvedInstances();
        Facade.setFacadeApplication(app);
        const Bar = Facade.create<any>('App/Bar');
        expect(Bar.getName()).toBe('bar');
    });

    it('facade create of binding class', async () => {
        const app = new Application();

        class Bar {
            getName() {
                return 'bar';
            }
        }

        app.bind('App/Bar', () => {
            return new Bar();
        });

        Facade.clearResolvedInstances();
        Facade.setFacadeApplication(app);
        const bar = Facade.create<any>('App/Bar');
        expect(bar.getName()).toBe('bar');
    });

    it('ensure proxy traps works fine on class instance', async () => {
        const app = new Application();

        class Bar {
            getName() {
                return 'bar';
            }
        }

        app.bind('App/BarFake', () => {
            return new Bar();
        });

        Facade.clearResolvedInstances();
        Facade.setFacadeApplication(app);
        const bar: any = Facade.create<any>('App/Bar', {
            fake: function() {
                const bar = this.app.make('App/BarFake');
                this.swap('App/Bar', bar);
                return bar;
            }
        });
        bar.fake();

        expect(bar.getName()).toBe('bar');
        expect(() => app.make('App/Bar')).toThrow();
    });

    it('ensure proxy traps works all on container', async () => {
        const app = new Application();

        class Bar {
            getName() {
                return 'bar';
            }
        }

        class BarFake {
            getName() {
                return 'barfake';
            }
        }

        app.bind('App/Bar', () => {
            return new Bar();
        });

        Facade.clearResolvedInstances();
        Facade.setFacadeApplication(app);
        const bar: any = Facade.create<any>('App/Bar', {
            fake: function() {
                const bar = new BarFake();
                this.swap('App/Bar', bar);
                return bar;
            }
        });
        bar.fake();

        expect(bar.getName()).toBe('barfake');
        expect(app.make('App/Bar').getName()).toBe('barfake');
    });

    it('inject method, properties to a facade', async () => {
        const app = new Application();
        app.bind('App/Bar', () => {
            return {
                getName() {
                    return 'bar';
                }
            }
        });

        Facade.clearResolvedInstances();
        Facade.setFacadeApplication(app);
        const Bar = Facade.create<any>('App/Bar', {
            name: 'bar',
            fullname: function() {
                return 'foo';
            }
        });

        expect(Bar.fullname()).toBe('foo');
        expect(Bar.name).toBe('bar');
    });
})
