/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/11/2020
 * Time: 2:41 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { Query, Resolver } from '@tngraphql/graphql';
import { UseMiddleware } from '../../../src/Decorators';



@Resolver()
export class ExampleResolve {
    constructor() {
    }

    @Query()
    @UseMiddleware(['auth:api', 'api'])
    @UseMiddleware(['auth:api3', 'api4'])
    create(): string {
        return 'string';
    }
}
