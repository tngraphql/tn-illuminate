/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/5/2020
 * Time: 7:36 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { AceServiceProvider } from '../../src/Foundation/Providers/AceServiceProvider';
import { Application } from '../../src/Foundation';
import { RouteListCommand } from '../../src/Foundation/Console/RouteListCommand';

describe('ace-sservice-provider', () => {

    it('register', async () => {
        const app = new Application(__dirname);
        // const ace = new AceServiceProvider(app);
        await app.register(new AceServiceProvider(app));

        expect(app.use('command.route.list')).toBeInstanceOf(RouteListCommand);
    });
})
