/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/26/2020
 * Time: 8:57 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { ServiceProvider } from '../Support/ServiceProvider';
import { Service } from '../Decorators';
import { HashManager } from './HashManager';

@Service()
export class HashServiceProvider extends ServiceProvider {

    register() {
        this.app.singleton('hash', () => {
            return new HashManager(this.app);
        });
    }
}
