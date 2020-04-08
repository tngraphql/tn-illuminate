import * as path from 'path';
import { ServiceProvider } from '../Support/ServiceProvider';
import {
    Adapter,
    BaseModel,
    belongsTo,
    column,
    computed,
    Database,
    hasMany, hasManyThrough,
    hasOne, manyToMany
} from '../Contracts/database/aliases';


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
            this.mergeConfigFrom(path.join(__dirname, '../config/database'), 'database');

            const db = new Database(this.app.config.get('database'), this.app.log, this.app.profiler);

            BaseModel.$adapter = new Adapter(db);

            return db;
        });

        this.app.singleton('orm', () => {
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
            const { DBFactory } = require('../Database/Factory/DBFactory');
            return new DBFactory(this.app);
        });
    }

    public boot(): void {
        BaseModel.$adapter = new Adapter(this.app.use('db'))
    }
}
