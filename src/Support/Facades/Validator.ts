import { Facade } from '../Facade';
import {Factory} from "../../Foundation/Validate/Factory";

/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/19/2020
 * Time: 1:25 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export const Validator: Factory = Facade.create<Factory>('validator');

