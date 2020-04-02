import { Application } from '../Application';

/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/10/2020
 * Time: 2:20 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class RegisterProviders {
    public async bootstrap(app: Application) {
        await app.registerConfiguredProviders();
    }
}