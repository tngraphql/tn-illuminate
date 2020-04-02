import { Env as EnvFactory } from '@adonisjs/env/build/src/Env'
import { EnvContract } from "@ioc:Adonis/Core/Env";

/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/15/2020
 * Time: 12:34 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class Env {
    static factory;

    static getFactory() {
        if ( ! this.factory ) {
            this.factory = new EnvFactory();
        }
        return this.factory;
    }

    static setFactory(factory: EnvContract) {
        this.factory = factory;
    }

    static getVariables() {
        return this.getFactory();
    }

    static get(key: string, defaultValue: any = null) {
        return this.getFactory().get(key, defaultValue);
    }
}