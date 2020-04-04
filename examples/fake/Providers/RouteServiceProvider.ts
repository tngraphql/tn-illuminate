/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/16/2020
 * Time: 8:39 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { RoutingServiceProvider } from '../../../src/Foundation/Routing/RoutingServiceProvider';

export class RouteServiceProvider extends RoutingServiceProvider {
    _namespace = 'App';

    map() {
        require(this.app.basePath('start/route'));
    }
}