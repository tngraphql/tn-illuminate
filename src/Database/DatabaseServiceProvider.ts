import * as path from 'path';
import { ServiceProvider } from '../Support/ServiceProvider';
import { Database } from 'tn-lucid/build/src/Database';
import { BaseModel } from 'tn-lucid/build/src/Orm/BaseModel';
import {
    belongsTo,
    column,
    computed,
    hasMany,
    hasManyThrough,
    hasOne,
    manyToMany
} from 'tn-lucid/build/src/Orm/Decorators';
import { Adapter } from 'tn-lucid/build/src/Orm/Adapter';

/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/18/2020
 * Time: 4:24 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class DatabaseServiceProvider extends ServiceProvider {
    /**
     * Register database binding
     */
    public register(): void {
        this.app.singleton('db', () => {
            const logger = this.app.use<any>('log');

            const profiler = this.app.use<any>('profiler');

            this.mergeConfigFrom(path.join(__dirname, '../config/database'), 'database');

            return new Database(this.app.config.get('database'), logger, profiler)
        });

        this.app.singleton('Tn/Lucid/Orm', () => {
            return {
                BaseModel,
                column,
                computed,
                hasOne,
                hasMany,
                belongsTo,
                manyToMany,
                hasManyThrough,
            }
        });

        this.app.singleton('factory', () => {
            const { DBFactory } = require('tn-lucid/build/src/Factory/DBFactory');
            return new DBFactory(this.app);
        });
    }

    public boot(): void {
        BaseModel.$adapter = new Adapter(this.app.use('db'))
    }
}