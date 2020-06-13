/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/10/2020
 * Time: 2:25 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { LoadConfiguration } from '../Bootstrap/LoadConfiguration';
import { LoadEnvironmentVariables } from '../Bootstrap/LoadEnvironmentVariables';
import { RegisterProviders } from '../Bootstrap/RegisterProviders';
import { BootProviders } from '../Bootstrap/BootProviders';
import { Application } from '../Application';
import { Service } from '../../Decorators/Service';
import { buildSchema, buildSchemaSync, MiddlewareStore } from '@tngraphql/graphql';
import { BuildContext, ScalarsTypeMap } from '@tngraphql/graphql/dist/schema/build-context';
import { RegisterFacades } from '../Bootstrap/RegisterFacades';
import { PubSubEngine, PubSubOptions } from 'graphql-subscriptions';
import { RouteStore } from '../Routing/RouteStore';

@Service()
export class GraphQLKernel {
    protected bootstrappers: Function[] = [
        LoadEnvironmentVariables,
        LoadConfiguration,
        RegisterFacades,
        RegisterProviders,
        BootProviders
    ];

    /**
     * global middleware
     */
    protected middleware = [];

    /**
     * Register name middleware
     */
    protected routeMiddleware = {};

    protected pubSub: PubSubEngine | PubSubOptions;

    protected scalarsMap: ScalarsTypeMap[];

    protected nullableByDefault: boolean = false;

    constructor(public app: Application) {

    }

    public async handle() {
        await this.bootstrap();
    }

    public async bootstrap() {
        if (! this.app.hasBeenBootstrapped()) {
            await this.app.bootstrapWith(this.bootstrappers);
        }
    }

    public async complie() {
        const app = this.app;
        const container: any = {
            store: new Map(),
            get(someClass, resolverData) {
                if ( typeof someClass === 'string' ) {
                    const lookedupNode = app.lookup(someClass);
                    if ( lookedupNode && lookedupNode.type === 'binding' ) {
                        return app.make(lookedupNode.namespace, resolverData);
                    }
                }
                return app.make(someClass, resolverData);
            },
            lookup(namespace: string) {
                return app.use(namespace);
            },
            bind(namespace, target) {
                app.bind(namespace, target);
            }
        };

        BuildContext.routerStoreFactory(this.app.use('route.store'));

        const middlewareStore = new MiddlewareStore();
        this.app.instance('middlewareStore', middlewareStore);
        middlewareStore
            .register(this.middleware)
            .registerNamed(this.routeMiddleware)

        return buildSchemaSync({
            router: this.app.route,
            container,
            middlewareStore,
            pubSub: this.pubSub,
            scalarsMap: this.scalarsMap,
            nullableByDefault: this.nullableByDefault
        });
    }
}
