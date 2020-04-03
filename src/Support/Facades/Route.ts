/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/15/2020
 * Time: 4:19 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { Facade } from '../Facade';
import { Router } from '@tngraphql/route';

export const Route = Facade.create<Router>('router');
