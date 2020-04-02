/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/26/2020
 * Time: 5:01 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { ApplicationContract } from '../Contracts/ApplicationContract';
import { InvalidArgumentException } from '../Container';
import _ = require('lodash');

export abstract class Manager {
    protected config: any;

    protected _drivers: Map<any, any> = new Map<any, any>();

    protected _customCreators: any = {};

    constructor(protected app: ApplicationContract) {
        this.config = this.app.config;
    }

    public abstract getDefaultDriver()

    public driver(driver: string = null) {
        driver = driver || this.getDefaultDriver();

        if ( ! driver ) {
            throw new InvalidArgumentException(`Unable to resolve NULL driver for [${ this.constructor.name }].`);
        }

        if ( ! this._drivers.has(driver) ) {
            this._drivers.set(driver, this.createDriver(driver));
        }

        return this._drivers.get(driver);
    }

    public createDriver(driver: string) {
        if ( this._customCreators[driver] ) {
            return this.callCustomCreator(driver);
        }
        const method = `create${ _.upperFirst(driver) }Driver`;
        if ( typeof this[method] == 'function' ) {
            return this[method]();
        }

        throw new InvalidArgumentException(`Driver [${ driver }] not supported.`)
    }

    public callCustomCreator(driver: string) {
        return this._customCreators[driver](this.app);
    }

    public extend(driver: string, callback: Function) {
        this._customCreators[driver] = callback;

        return this;
    }

    public getDrivers() {
        return this._drivers;
    }
}
