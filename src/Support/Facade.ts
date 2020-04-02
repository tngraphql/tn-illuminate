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
    static _instance: {[key: string]: any} = {};

    static _namespace: string;

    static app: ApplicationContract;

    static create<T>(namespace: string) {
        const base: any = {
            __ref: null
        };
        this._instance[namespace] = base;
        return new Proxy(base, {
            get: (target, prop) => {
                if ( ! target.__ref ) {
                    if ( this.app ) {
                        target.__ref = this.app.use(namespace);
                    }
                }
                return target.__ref[prop];
            },
        }) as T;
    }

    static clearResolvedInstances() {
        for( let namespace of Object.keys(this._instance) ) {
            this._instance[namespace].__ref = undefined;
        }
    }

    static setFacadeApplication(app: ApplicationContract) {
        this.app = app;
    }
}