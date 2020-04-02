/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/14/2020
 * Time: 10:33 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { AceApplication, ConsoleKernel } from '../../src/Foundation/Console';
import { Application } from '../../src/Foundation';
import { Filesystem } from '@poppinss/dev-utils/build';
import { join } from "path";
import { MiddlewareMakeCommand } from '../../src/Foundation/Console/MiddlewareMakeCommand';

const fs = new Filesystem(join(__dirname, './app2'))

describe('Middleware Make', () => {

    afterEach(async () => {
        jest.resetModules();
        await fs.cleanup();
    });

    beforeAll(async () => {
        AceApplication.starting(ace => {
            ace.register([MiddlewareMakeCommand]);
        });
    });

    beforeEach(async () => {
        await fs.add('config/app.ts', `export default {
            providers: []
        }`);
    })

    it('make a new middleware', async () => {
        const app = new Application(fs.basePath);

        const kernel: ConsoleKernel = await app.make<ConsoleKernel>(ConsoleKernel);

        await kernel.call('make:middleware', ['user']);

        expect(await fs.get('app/GraphQL/Middleware/User.ts')).toMatchSnapshot()
    });
});