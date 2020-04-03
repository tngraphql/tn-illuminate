/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/14/2020
 * Time: 4:26 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { BaseCommand, flags } from '@tngraphql/console';
import { Router } from '@tngraphql/route';
import { Inject } from '../../Decorators/Inject';
import { RouteStore } from '../Routing/RouteStore';
import { ApplicationContract } from '../../Contracts/ApplicationContract';
import { getMetadataStorage } from '@tngraphql/graphql/dist/metadata/getMetadataStorage';

const Table = require('cli-table3');

export class RouteListCommand extends BaseCommand {
    /**
     * Command name. The command will be registered using this name only. Make
     * sure their aren't any spaces inside the command name.
     */
    static commandName: string = 'list:route';

    static description: string = 'List application routes';

    @flags.boolean({ description: 'Output as JSON' })
    public json: boolean

    async handle(@Inject('router') router: Router) {
        if (this.json) {
            this.log(JSON.stringify(this.outputJSON(router), null, 2))
        } else {
            this.log(this.outputTable(router))
        }
    }

    /**
     * Log message
     */
    log(message) {
        if ( this.application.environment === 'test' ) {
            this.logger.logs.push(message);
        } else {
            console.log(message);
        }
    }

    /**
     * Output routes a table string
     */
    outputTable(router) {
        const table = new Table({
            head: ['Method', 'Name', 'Handler', 'Middleware'].map((col) => this.colors.cyan(col)),
        });
        this.outputJSON(router).forEach((route) => {
            const row = [
                `${ this.colors.dim(route.method) }`,
                `${ route.name }`,
                typeof (route.handler) === 'function' ? 'Closure' : route.handler,
                route.middleware.join(',')
            ];
            table.push(row);
        });
        return table.toString();
    }

    /**
     * Returns an array of routes as JSON
     */
    outputJSON(router) {
        const store = new RouteStore(this.application as ApplicationContract);
        store.boot(router);

        return store['lookupStore'].map((route) => {
            const md = getMetadataStorage().middlewares
                                           .filter(x => x.target === route.target && x.fieldName === route.action)
                                           .map(x => x.middlewares);

            const middleware = route
                ? [...route.middleware, ...md].map((one) => typeof (one) === 'function' ? 'Closure' : one)
                : [];

            return {
                method: route.method,
                name: route.handleName || '',
                handler: route.handler,
                middleware: middleware,
            };
        });
    }
}
