/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/15/2020
 * Time: 3:16 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Application } from '../src/Foundation';

describe('Container | Resolver', () => {
    it('call namespace expression', async () => {
        class UserController {
            public handle () {
                return 'foo'
            }
        }

        const app = new Application()
        app.bind('App/UserController', () => new UserController())

        const resolver = app.getResolver();

        expect(resolver.call('App/UserController')).toBe('foo');
    });

    it('call namespace expression with method', async () => {
        class UserController {
            public getUser () {
                return 'foo'
            }
        }

        const app = new Application()
        app.bind('App/UserController', () => new UserController())

        const resolver = app.getResolver()

        expect(resolver.call('App/UserController.getUser')).toBe('foo');
    });

    it('call async namespace expression', async () => {
        class UserController {
            public async getUser () {
                return 'foo'
            }
        }

        const app = new Application()
        app.bind('App/UserController', () => new UserController())

        const resolver = app.getResolver()
        const value = await resolver.call('App/UserController.getUser')
        expect(value).toBe('foo');
    });

    it('raise exception when unable to lookup namespace', async () => {
        const app = new Application()
        const resolver = app.getResolver()

        try {
            resolver.call('App/UserController.getUser')
        } catch (e) {
            expect(e.message).toBe('Unable to resolve App/UserController namespace from IoC container');
        }
    });

    it('allow runtime prefix namespace', async () => {
        class UserController {
            public handle () {
                return 'foo'
            }
        }

        const app = new Application()
        app.bind('App/UserController', () => new UserController())

        const resolver = app.getResolver();

        expect(resolver.call('UserController', 'App')).toBe('foo');
    });

    it('handle use case where namespace is same but prefix namespace is different', async () => {
        class UserController {
            public handle () {
                return 'user'
            }
        }

        class AdminController {
            public handle () {
                return 'admin'
            }
        }

        const app = new Application()
        app.bind('App/UserController', () => new UserController())
        app.bind('Admin/UserController', () => new AdminController())

        const resolver = app.getResolver()

        expect(resolver.call('UserController', 'App')).toBe('user');
        expect(resolver.call('UserController', 'Admin')).toBe('admin');
    });

    it('handle use case where namespace is same but defined a different runtime prefix namespace', async () => {
        class UserController {
            public handle () {
                return 'user'
            }
        }

        class AdminController {
            public handle () {
                return 'admin'
            }
        }

        const app = new Application()
        app.bind('App/UserController', () => new UserController())
        app.bind('Admin/UserController', () => new AdminController())

        const resolver = app.getResolver(undefined, undefined, 'App')

        expect(resolver.call('UserController')).toBe('user');
        expect(resolver.call('UserController', 'Admin')).toBe('admin');
    });

    it('pass resolve result to the call method', async () => {
        class UserController {
            public getUser () {
                return 'foo'
            }
        }

        const app = new Application()
        app.bind('App/UserController', () => new UserController())

        const resolver = app.getResolver()
        const lookupNode = resolver.resolve('App/UserController.getUser')

        expect(resolver.call(lookupNode)).toBe('foo');
    });
});