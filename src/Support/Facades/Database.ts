import { Facade } from '../Facade';
import {DatabaseContract} from "@ioc:Adonis/Lucid/Database";

/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/19/2020
 * Time: 9:25 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export const Database = Facade.create<DatabaseContract>('db');
