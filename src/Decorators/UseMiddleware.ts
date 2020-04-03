/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/21/2020
 * Time: 4:47 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { UseMiddleware as BaseUseMiddleware } from '@tngraphql/graphql';
import { MiddlewareNode } from '@tngraphql/route/dist/Contracts/Route';

export const UseMiddleware = (md: MiddlewareNode | MiddlewareNode[]) => {
    return BaseUseMiddleware(md as any)
}
