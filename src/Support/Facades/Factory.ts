import { Facade } from '../Facade';
import { DBFactory } from '@tngraphql/lucid/build/src/Factory/DBFactory';

/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/24/2020
 * Time: 11:23 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export const Factory: DBFactory = Facade.create<DBFactory>('factory')

