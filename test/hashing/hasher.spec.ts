/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/26/2020
 * Time: 9:02 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Application, LoadConfiguration } from '../../src/Foundation';
import { HashManager } from '../../src/Hashing/HashManager';
import { HashServiceProvider } from '../../src/Hashing/HashServiceProvider';

describe('Hash', () => {
    it('default driver', async () => {
        const app = new Application();
        new LoadConfiguration().bootstrap(app);

        const hash = new HashManager(app);

        expect(hash.getDefaultDriver()).toBe('bcrypt');
    });

    it('config default driver', async () => {
        const app = new Application();
        new LoadConfiguration().bootstrap(app);
        app.config.set('hashing', {
            driver: 'test'
        })

        const hash = new HashManager(app);

        expect(hash.getDefaultDriver()).toBe('test');
    });

    it('simple bcrypt hash', async () => {
        const app = new Application();
        new LoadConfiguration().bootstrap(app);

        const hash = new HashManager(app);

        expect(hash.make('123456').startsWith('$2y')).toBeTruthy();
    });

    it('simple bcrypt check', async () => {
        const app = new Application();
        new LoadConfiguration().bootstrap(app);

        const hash = new HashManager(app);
        const hashed = '$2y$10$PLe.T0NWksSaCCaX7KhBeeUoLdW19tzW2oa.wwcmeVlQK9KkjK7Be';

        expect(hash.check('123456', hashed)).toBeTruthy();
    });

    it('check register hash', async () => {
        const app = new Application();
        new LoadConfiguration().bootstrap(app);
        app.register(new HashServiceProvider(app));

        expect(app.use('hash')).toBeInstanceOf(HashManager);
    });
});
