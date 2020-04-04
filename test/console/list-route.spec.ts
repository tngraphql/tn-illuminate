/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/21/2020
 * Time: 5:42 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Application, ConsoleKernel } from '../../src/Foundation';
import { RouteListCommand } from '../../src/Foundation/Console/RouteListCommand';
import { Query, Resolver } from '@tngraphql/graphql';

describe('Command | List routes', () => {
    it('list routes in the order they are register', async () => {
        const app = new Application();
        app.environment = 'test';
        const kernel: ConsoleKernel = await app.make<ConsoleKernel>(ConsoleKernel);

        app.singleton('Handle', class A {})

        app.route.query('about', 'Handle.about');
        app.route.query('contact', 'Handle.contact');

        const listRoutes: RouteListCommand = new RouteListCommand(app, kernel.getAce());

        listRoutes.json = true;

        await listRoutes.handle(app.route);

        expect(JSON.parse(listRoutes.logger.logs[0])).toEqual([
            {
                method: 'query',
                name: 'about',
                handler: 'Handle.about',
                middleware: []
            },
            {
                method: 'query',
                name: 'contact',
                handler: 'Handle.contact',
                middleware: []
            }
        ]);
    });

    it('list routes with assigned middleware', async () => {
        const app = new Application();
        app.environment = 'test';
        const kernel: ConsoleKernel = await app.make<ConsoleKernel>(ConsoleKernel);

        app.singleton('Handle', class A {})

        app.route.query('about', 'Handle.about');
        app.route.query('contact', 'Handle.contact').middleware(['auth', 'acl:admin']);
        app.route.query('closure', 'Handle.closure').middleware(async function(context, next) {
            await next();
        });

        const listRoutes: RouteListCommand = new RouteListCommand(app, kernel.getAce());

        listRoutes.json = true;

        await listRoutes.handle(app.route);

        expect(JSON.parse(listRoutes.logger.logs[0])).toEqual([
            {
                method: 'query',
                name: 'about',
                handler: 'Handle.about',
                middleware: []
            },
            {
                method: 'query',
                name: 'contact',
                handler: 'Handle.contact',
                middleware: ['auth', 'acl:admin']
            },
            {
                "handler": "Handle.closure",
                "method": "query",
                "middleware": [
                    "Closure"
                ],
                "name": "closure"
            }
        ]);
    });

    it('output complete controller namespace when using a custom namespace', async () => {
        const app = new Application();
        app.environment = 'test';
        const kernel: ConsoleKernel = await app.make<ConsoleKernel>(ConsoleKernel);

        app.singleton('Handle', class A {})
        app.singleton('App/Contact', class A {})

        app.route.query('about', 'Handle.about');
        app.route.query('contact', 'Contact.contact').namespace('App');

        const listRoutes: RouteListCommand = new RouteListCommand(app, kernel.getAce());

        listRoutes.json = true;

        await listRoutes.handle(app.route);

        expect(JSON.parse(listRoutes.logger.logs[0])).toEqual([
            {
                method: 'query',
                name: 'about',
                handler: 'Handle.about',
                middleware: []
            },
            {
                method: 'query',
                name: 'contact',
                handler: 'Contact.contact',
                middleware: []
            }
        ]);
    });
});
