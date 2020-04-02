/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/11/2020
 * Time: 7:56 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Application } from '../src/Foundation/Application';
import { ServiceProvider } from '../src/Support/ServiceProvider';
import { Repository } from '../src/config/Repository';
import { Filesystem } from '@poppinss/dev-utils/build';
import { join } from "path";
import * as path from 'path';
import { Injector } from '../src/Container';
import { Service } from '../src/Decorators';

const fs = new Filesystem(join(__dirname, './app'))

describe('ServiceProvider', () => {
    beforeAll(async () => {
        jest.resetModules()
        await fs.cleanup();
    });
    afterAll(async () => {
        await fs.cleanup();
    })
    it('get instace', async () => {
        const app = new Application();
        const service: any = new ServiceProvider(app);
        expect(service.app).toBe(app);
    });

    it('serviceProvider | mergeConfigFrom', async () => {
        await fs.add('config/app.ts', `
                export default {
                    name: 'test',
                    newField: 'test'
                }
            `);

        const app = new Application(fs.basePath);
        app.instance('config', new Repository({
            app: {
                name: 'config'
            }
        }));

        @Service()
        class MyProvider extends ServiceProvider {
            constructor(protected app: Application) {
                super(app);
                this.mergeConfigFrom(path.join(fs.basePath, 'config/app.ts'), 'app');
            }
        }

        const service = app.make<MyProvider>(MyProvider);
        expect(app.config.get('app.name')).toBe('config');
        expect(app.config.get('app.newField')).toBe('test');
    });
});