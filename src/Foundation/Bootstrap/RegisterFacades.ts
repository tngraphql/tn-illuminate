import { Application } from '../Application';
import { Facade } from '../../Support/Facade';

/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/16/2020
 * Time: 10:31 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class RegisterFacades {
    public bootstrap(app: Application) {
        Facade.clearResolvedInstances();

        Facade.setFacadeApplication(app);
    }
}