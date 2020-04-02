/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/18/2020
 * Time: 12:41 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { DatabaseRule } from './DatabaseRule';

type UniqueType = {
    model: string;
    column: string;
    ignore: {
        id?: string;
        idColumn: string;
    }
    where?: any
}

export class ExistsRule extends DatabaseRule {
    public exists: { [key: string]: any };

    constructor(model, column) {
        super();
        this.exists = {
            model,
            column,
            where: {}
        };
    }

    /**
     *
     * @param args
     * @returns {Exists}
     */
    public where(column: any, value?: any): this {
        if ( value === undefined ) {
            return super.where('exists', column);
        }
        return super.where('exists', column, value);
    }
}