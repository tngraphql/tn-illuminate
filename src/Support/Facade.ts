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
    static _instance: { [key: string]: any } = {};

    static app: ApplicationContract;

    /**
     * Hotswap the underlying instance behind the facade.
     *
     * @param namespace
     * @param instance
     */
    static swap(namespace, instance) {
        this._instance[namespace] = instance;
        if ( this.app ) {
            const node = this.app.lookup(namespace);
            if ( node ) {
                const binding = this.app.bindings.get(node.namespace);
                this.app.bind(node.namespace, () => instance, binding.singleton);
            }
        }
    }

    static create<T>(namespace: string, handler?: any): T {
        this._instance[namespace] = undefined;
        return new Proxy({}, {
            get: (target, prop) => {
                if ( handler && handler[prop] ) {
                    if ( typeof handler[prop] === 'function' ) {
                        return handler[prop].bind(this);
                    }
                    return handler[prop];
                }
                if ( ! this._instance[namespace] ) {
                    if ( this.app ) {
                        this._instance[namespace] = this.app.use(namespace);
                    }
                }
                return this._instance[namespace][prop];
            },
        }) as T;
    }

    static clearResolvedInstances() {
        for( let namespace of Object.keys(this._instance) ) {
            this._instance[namespace] = undefined;
        }
    }

    static setFacadeApplication(app: ApplicationContract) {
        this.app = app;
    }
}
