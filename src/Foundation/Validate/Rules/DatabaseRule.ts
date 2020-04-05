/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/19/2020
 * Time: 7:10 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { isFuntion, uid } from '../../../utils';

type OneOrMany<T> = T | T[];

type ValueWhere = OneOrMany<string | number>;

function assertWhereValue(value: string, name: string) {
    if ( typeof value !== 'string') {
        throw new TypeError(`${name} must be string`);
    }
}

export abstract class DatabaseRule {

    /**
     * Set a "where" constraint on the query.
     *
     * @param name
     * @param args
     */
    public where(name, ...args) {
        let where = {};
        if ( isFuntion(args[0]) ) {
            this[name].where.push(args[0]);
            return this;
        }
        if ( args.length === 1 ) {
            this[name].where.push(args[0]);
        } else {
            this[name].where.push([
                args.shift(),
                args.length === 1 ? String(args[0]) : args
            ]);
            // this[name].where[args.shift()] = args.length === 1 ? String(args[0]) : args;
        }

        return this;
    }

    /**
     * Set a "where not" constraint on the query.
     *
     * @param column
     * @param value
     */
    public whereNot(column: string, value: string) {
        assertWhereValue(column, 'column');
        assertWhereValue(value, 'value');

        return this.where(column, `!${ value }`);
    }

    /**
     * Set a "where null" constraint on the query.
     *
     * @param column
     */
    public whereNull(column: string) {
        assertWhereValue(column, 'column');
        return this.where(column, null);
    }

    /**
     * Set a "where not null" constraint on the query.
     *
     * @param column
     */
    public whereNotNull(column: string) {
        assertWhereValue(column, 'column');
        return this.where(column, 'NOT_NULL');
    }

    /**
     * Set a "where in" constraint on the query.
     *
     * @param column
     * @param value
     */
    public whereIn(column: string, value: ValueWhere): this {
        assertWhereValue(column, 'column');
        return this.using(where => {
            where.whereIn(column, value)
        });
    }

    /**
     * Set a "where not in" constraint on the query.
     *
     * @param column
     * @param value
     */
    public whereNotIn(column: string, value: ValueWhere): this {
        assertWhereValue(column, 'column');

        return this.using(query => {
            query.whereNotIn(column, value);
        });
    }

    /**
     * Register a custom query callback.
     * @param callback
     */
    public using(callback: (query) => any): this {
        return this.where(callback);
    }
}
