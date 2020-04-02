/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/21/2020
 * Time: 6:02 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Application, ConsoleKernel } from '../src/Foundation';
import { RouteStore } from '../src/Foundation/Routing/RouteStore';
import { ApplicationContract } from '../src/Contracts/ApplicationContract';

describe('Route | Store', () => {
    it('list routes in the order they are register', async () => {
        const app = new Application();
        app.environment = 'test';
        const kernel: ConsoleKernel = await app.make<ConsoleKernel>(ConsoleKernel);

        app.singleton('Handle', class A {})

        app.route.query('queryName1', 'Handle.about');
        app.route.query('queryName2', 'Handle.about');
        app.route.query('queryName3', 'Handle.about');
        app.route.query('queryName4', 'Handle.about');
        app.route.query('queryName5', 'Handle.about');
        app.route.query('queryName6', 'Handle.about');
        app.route.query('queryName7', 'Handle.contact');

        const store = new RouteStore(app as ApplicationContract);
        store.boot(app.route);

        expect(store.queries[0].handleName).toBe('queryName1');
        expect(store.queries[1].handleName).toBe('queryName2');
        expect(store.queries[2].handleName).toBe('queryName3');
        expect(store.queries[3].handleName).toBe('queryName4');
        expect(store.queries[4].handleName).toBe('queryName5');
        expect(store.queries[5].handleName).toBe('queryName6');
        expect(store.queries[6].handleName).toBe('queryName7');
    });

    it('raise error when route with duplicate query name', async () => {
        const app = new Application();
        app.environment = 'test';
        const kernel: ConsoleKernel = await app.make<ConsoleKernel>(ConsoleKernel);

        app.singleton('Handle', class A {})

        app.route.query('queryName1', 'Handle.about');
        app.route.query('queryName2', 'Handle.about');
        app.route.query('queryName3', 'Handle.about');
        app.route.query('queryName4', 'Handle.about');
        app.route.query('queryName5', 'Handle.about');
        app.route.query('queryName', 'Handle.about');
        app.route.query('queryName', 'Handle.contact');

        const store = new RouteStore(app as ApplicationContract);
        store.boot(app.route);

        expect(store.queries).toHaveLength(6);
        expect(store.queries.find(x => x.handleName === 'queryName').handler).toBe('Handle.contact');
    });

    it('raise error when route with duplicate mutation name', async () => {
        const app = new Application();
        app.environment = 'test';
        const kernel: ConsoleKernel = await app.make<ConsoleKernel>(ConsoleKernel);

        app.singleton('Handle', class A {})

        app.route.query('queryName', 'Handle.about');
        app.route.mutation('mutationName1', 'Handle.mutation');
        app.route.mutation('mutationName2', 'Handle.mutation');
        app.route.mutation('mutationName3', 'Handle.mutation');
        app.route.mutation('mutationName4', 'Handle.mutation');
        app.route.mutation('mutationName', 'Handle.mutation');
        app.route.mutation('mutationName', 'Handle.contact');

        const store = new RouteStore(app as ApplicationContract);
        store.boot(app.route);
        expect(store.mutations).toHaveLength(5);
        expect(store.mutations.find(x => x.handleName === 'mutationName').handler).toBe('Handle.contact');
    });

    it('raise error when route with duplicate subscriptions name', async () => {
        const app = new Application();
        app.environment = 'test';
        const kernel: ConsoleKernel = await app.make<ConsoleKernel>(ConsoleKernel);

        app.singleton('Handle', class A {})

        app.route.query('queryName', 'Handle.about');
        app.route.subscription('subcriptionName1', 'Handle.sub');
        app.route.subscription('subcriptionName2', 'Handle.sub');
        app.route.subscription('subcriptionName3', 'Handle.sub');
        app.route.subscription('subcriptionName4', 'Handle.sub');
        app.route.subscription('subcriptionName', 'Handle.sub');
        app.route.subscription('subcriptionName', 'Handle.contact');
        const store = new RouteStore(app as ApplicationContract);
        store.boot(app.route);

        expect(store.subscriptions).toHaveLength(5);
        expect(store.subscriptions.find(x => x.handleName === 'subcriptionName').handler).toBe('Handle.contact');
    });
});