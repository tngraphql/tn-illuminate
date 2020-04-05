/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/18/2020
 * Time: 12:39 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { DatabaseRule } from './DatabaseRule';
import { isFuntion } from '../../../utils';

type UniqueType = {
    model: string;
    column: string;
    ignore: {
        id?: string;
        idColumn: string;
    }
    where?: any
}

export class UniqueRule extends DatabaseRule{
    public unique: UniqueType;

    constructor(model, column) {
        super();
        this.unique = {
            model,
            column,
            ignore: {
                id: null,
                idColumn: 'id'
            },
            where: []
        };
    }

    /**
     *
     * @param id
     * @param idColumn
     * @returns {Unique}
     */
    public ignore(id, idColumn = 'id'): this {
        this.unique.ignore = { id, idColumn };
        return this;
    }

    /**
     * Set a "where" constraint on the query.
     *
     * @param column
     * @param value
     */
    public where(column: any, value?: any): this {
        if ( typeof column !== 'string' && !isFuntion(column) ) {
            throw new TypeError('column must be string or function callback');
        }

        if ( value === undefined ) {
            return super.where('unique', column, null);
        }
        return super.where('unique', column, value);
    }
}
