/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/15/2020
 * Time: 9:54 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { Service } from '../../Decorators/Service';
import { Application } from '../../Foundation/Application';
import { Router } from 'tn-route';
import { RouteStore } from './RouteStore';

@Service()
export class RoutingServiceProvider {
    /**
     * The controller namespace for the application.
     *
     * @var string|null
     */
    protected _namespace;

    /**
     * Create a new service provider instance.
     * @param app
     */
    constructor(protected app: Application) {
    }

    register() {
        this.app.singleton('router', () => {
            return new Router();
        });

        this.app.instance('route', this.app.use('router'));

        this.app.singleton('route.store', () => {
            return new RouteStore(this.app);
        });
    }

    boot() {
        this.loadRoutes();
    }

    /**
     * Load the application routes.
     *
     * @return void
     */
    protected loadRoutes()
    {
        if (typeof this['map'] === 'function') {
            this.app.call(this, 'map');
        }
    }
}