/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/18/2020
 * Time: 4:39 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { ConnectionResolverInterface } from '../../Database/ConnectionResolverInterface';
import { Op } from '../../Database/Op';
import { PresenceVerifierInterface } from './PresenceVerifierInterface';

export class DatabasePresenceVerifier implements PresenceVerifierInterface {
    private __connection: any;

    constructor(public db: ConnectionResolverInterface) {
    }

    async getCount(collection, column, value, excludeId = null, idColumn = null, extra: any = []) {
        const query = this.table(collection);

        if ( Array.isArray(value) ) {
            query.where(column, Op.in, value);
        } else {
            query.where(column, Op.eq, value)
        }

        if ( excludeId ) {
            query.where(idColumn || 'id', Op.ne, excludeId);
        }

        this.addConditions(query, extra)

        const result = await (query as any).count('* as total');

        return result[0];
    }

    addConditions(query, conditions) {
        for( let condition of conditions ) {
            let [key, value] = [null, null];
            if ( Array.isArray(condition) ) {
                [key, value] = condition as any;
            } else {
                value = condition;
            }

            if ( typeof value === 'function' ) {
                query.where(function(where) {
                    value(where);
                });
            } else {
                this.addWhere(query, key, value);
            }
        }

        return query;
    }

    addWhere(query, key, extraValue) {
        if ( Array.isArray(extraValue) ) {
            query.where(key, ...extraValue);
        } else if ( extraValue === null || extraValue === 'null') {
            query.whereNull(key);
        } else if ( extraValue === 'NOT_NULL' ) {
            query.whereNotNull(key);
        } else if ( extraValue.startsWith('!') ) {
            query.where(key, '!=', extraValue.substr(1));
        } else {
            query.where(key, extraValue);
        }
    }

    table(table: string) {
        return this.db.connection(this.__connection).from(table);
    }

    setConnection(connection) {
        this.__connection = connection;
    }
}
