/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/17/2020
 * Time: 1:34 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { ExistsRule, UniqueRule } from './Rules';
import _ = require('lodash');

type Maybe<T> = T | T[];

export class Rule {
    /**
     *
     * @param model
     * @param column
     * @returns {Unique}
     */
    public static unique(model, column): UniqueRule {
        const unique = new UniqueRule(model, column);
        return unique
    }

    /**
     *
     * @param model
     * @param column
     * @returns {Exists}
     */
    public static exists(model, column): ExistsRule {
        return new ExistsRule(model, column);
    }

    /**
     *
     * @param value {string}
     *  @returns {string}
     */
    public static notIn(value: Maybe<string | number>): string {
        if ( typeof value === 'number' ) {
            value = String(value);
        }
        return `not_in:${ _.toArray(value).join(',') }`;
    }

    /**
     *
     * @param value {array|string|number}
     * @returns {string}
     */
    public static in(value: Maybe<string | number>): string {
        if ( typeof value === 'number' ) {
            value = String(value);
        }
        return `in:${ _.toArray(value).join(',') }`;
    }
}
