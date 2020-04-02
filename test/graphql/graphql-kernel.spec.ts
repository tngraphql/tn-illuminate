/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/15/2020
 * Time: 9:36 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Application, GraphQLKernel } from '../../src/Foundation';
import { Filesystem } from '@poppinss/dev-utils/build';
import { join } from "path";
import { graphql } from 'graphql';
import { initProject, initProject2, initProjectApplyMiddleware } from './helpers';

let fs = new Filesystem(join(__dirname, './app'))


describe('GraphQL Kernel', () => {
    afterEach(async () => {
        await fs.cleanup();
    })

    it('Make Kernel', async () => {
        await initProject(fs);
        const app = new Application(fs.basePath);

        await app.make<GraphQLKernel>(GraphQLKernel).handle();

        expect(app.config.get('app.name')).toEqual('test');
    });

    it('load router', async () => {
        fs.basePath = join(__dirname, './app2')
        await initProject(fs);

        const app = new Application(fs.basePath);

        const kernel: GraphQLKernel = app.make<GraphQLKernel>(GraphQLKernel);
        await kernel.handle();

        expect(app.route.toJSON()).toEqual([{
            method: 'query',
            handleName: 'name',
            handler: 'UserResolve.index',
            middleware: [],
            meta: {
                namespace: "App",
            }
        }]);

        expect(app.config.get('app.name')).toEqual('test');
    });

    it('complie schema graphql', async () => {
        fs.basePath = join(__dirname, './app3')
        const app = new Application(fs.basePath);

        const kernel: GraphQLKernel = await app.make<GraphQLKernel>(GraphQLKernel);

        app.autoload(join(fs.basePath, 'app'), 'App');

        await initProject2(fs);

        await kernel.handle();

        const schema = await kernel.complie();

        const query = `query {
            name
          }`;

        const result = await graphql(schema, query);

        const getterFieldResult = result.data!.name;
        expect(getterFieldResult).toBe('nguyen');
    });

    it('Apply middleware', async () => {
        fs.basePath = join(__dirname, './app_apply_middleware');
        await initProjectApplyMiddleware(fs);

        const app = new Application(fs.basePath);

        const {Kernel} = require(join(fs.basePath, 'app/Kernel'));

        const kernel: GraphQLKernel = await app.make<GraphQLKernel>(Kernel);

        app.autoload(join(fs.basePath, 'app'), 'App');

        await kernel.handle();

        const schema = await kernel.complie();

        const query = `query {
            name
          }`;

        const result = await graphql(schema, query);

        expect(result.errors[0].message).toBe('test middleware');
    });
});
