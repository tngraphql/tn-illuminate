/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/16/2020
 * Time: 2:33 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { RouterResolver, RouterStoreFactory } from '@tngraphql/graphql/dist/interfaces/RouterStoreFactory';
import { RouterType } from '@tngraphql/graphql/dist/router';
import { ApplicationContract } from '../../Contracts/ApplicationContract';

export class RouteStore implements RouterStoreFactory {
    public resolvers: Function[];

    public queries: RouterResolver[] = [];
    public mutations: RouterResolver[] = [];
    public subscriptions: RouterResolver[] = [];
    public route: RouterType;
    public lookupStore: any = [];

    constructor(public app: ApplicationContract) {
    }

    public boot(route) {
        this.reset();
        this.route = route;
        this.route.toJSON().forEach(route => {
            const namespace = route.handler.split('.');

            let action = 'index';

            if ( namespace.length ) {
                action = namespace.pop();
            }

            let target = this.app.use(this.app.compileNamespace(namespace.join('.'), route.meta?.namespace));

            this.resolvers.push(target as Function);

            this.lookupStore.push({
                ...route,
                target,
                action
            });

            switch (route.method) {
            case 'query':
                const qindex: number = this.queries.findIndex(x => x.handleName === route.handleName);
                if ( qindex !== -1 ) {
                    this.queries.splice(qindex, 1);
                }

                this.queries.push({
                    ...route,
                    target,
                    action
                });
                break;
            case 'mutation':
                const mindex = this.mutations.findIndex(x => x.handleName === route.handleName);
                if ( mindex !== -1 ) {
                    this.mutations.splice(mindex, 1);
                }
                this.mutations.push({
                    ...route,
                    target,
                    action
                })
                break;
            case 'subscription':
                const sindex = this.subscriptions.findIndex(x => x.handleName === route.handleName);
                if ( sindex !== -1 ) {
                    this.subscriptions.splice(sindex, 1);
                }
                this.subscriptions.push({
                    ...route,
                    target,
                    action
                })
            }

        });
    }

    public reset() {
        this.resolvers = [];
        this.queries = [];
        this.mutations = [];
        this.subscriptions = [];
        this.route = undefined;
    }

    public getRouterResolvers(method: string): RouterResolver[] {
        switch (method) {
        case 'query':
            return this.queries;
            break;
        case 'mutation':
            return this.mutations;
            break;
        case 'subscription':
            return this.subscriptions;
        }
        return [];
    }
}
