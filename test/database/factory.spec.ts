/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/24/2020
 * Time: 11:22 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Application } from '../../src/Foundation';
import { DatabaseServiceProvider } from '../../src/Database/DatabaseServiceProvider';
import { DBFactory } from 'tn-lucid/build/src/Factory/DBFactory';
import { Facade } from '../../src/Support/Facade';
import { Factory } from '../../src/Support/Facades';

describe('Factory', () => {
    it('init factory', async () => {
        const app = new Application();
        await app.register(new DatabaseServiceProvider(app));
        const factory = app.use('factory');

        expect(factory).toBeInstanceOf(DBFactory);
    });

    it('init facades factory', async () => {
        const app = new Application();
        await app.register(new DatabaseServiceProvider(app));
        Facade.setFacadeApplication(app);
        Factory.blueprint('users', () => {})

        expect(Factory.getBlueprint('users').name).toBe('users');
    });
});