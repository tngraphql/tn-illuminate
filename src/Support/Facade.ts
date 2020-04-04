import { ApplicationContract } from '../Contracts/ApplicationContract';

/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/15/2020
 * Time: 8:25 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class Facade {
    /**
     * The resolved object instances.
     */
    static _instances: { [key: string]: any } = {};

    /**
     * The application instance being facaded.
     *
     */
    static app: ApplicationContract;

    /**
     * Hotswap the underlying instance behind the facade.
     *
     * @param namespace
     * @param instance
     */
    static swap(namespace, instance): void {
        this._instances[namespace] = instance;
        if ( this.app ) {
            const node = this.app.lookup(namespace);
            if ( node ) {
                const binding = this.app.bindings.get(node.namespace);
                this.app.bind(node.namespace, () => instance, binding.singleton);
            }
        }
    }

    /**
     * Create facade instance
     *
     * @param namespace
     * @param handler
     */
    static create<T>(namespace: string, handler?: any): T {
        this._instances[namespace] = undefined;
        return new Proxy({}, {
            get: (target, prop) => {
                if ( handler && handler[prop] ) {
                    if ( typeof handler[prop] === 'function' ) {
                        return handler[prop].bind(this);
                    }
                    return handler[prop];
                }
                if ( ! this._instances[namespace] ) {
                    if ( this.app ) {
                        this._instances[namespace] = this.app.use(namespace);
                    }
                }
                return this._instances[namespace][prop];
            },
        }) as T;
    }

    /**
     * Clear all of the resolved instances.
     *
     */
    static clearResolvedInstances() {
        for( let namespace of Object.keys(this._instances) ) {
            this._instances[namespace] = undefined;
        }
    }

    /**
     * Set the application instance.
     *
     * @param app
     */
    static setFacadeApplication(app: ApplicationContract) {
        this.app = app;
    }
}
