/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/21/2020
 * Time: 8:44 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { Facade } from '../Facade';
import {LoggerContract} from "@ioc:Adonis/Core/Logger";

export const Logger: LoggerContract = Facade.create('log');
