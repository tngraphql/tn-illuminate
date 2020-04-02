/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/15/2020
 * Time: 7:23 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { AceApplication, Application, ConsoleKernel } from '../../src/Foundation';
import { Filesystem } from '@poppinss/dev-utils/build';
import { join } from "path";
import { KeyGenerateCommand } from '../../src/Foundation/Console/KeyGenerateCommand';

const fs = new Filesystem(join(__dirname, './key'))

describe('Generate Key', () => {
    beforeAll(async () => {
        await fs.add('.env', ``);
        AceApplication.starting(ace => {
            ace.register([KeyGenerateCommand]);
        });
    });

    beforeEach(async () => {
        await fs.add('config/app.ts', `export default {
            providers: []
        }`);
    })

    afterEach(async () => {
        jest.resetModules();
        await fs.cleanup();
    });

    it('Generate a new key', async () => {
        const app = new Application(fs.basePath);

        const kernel: ConsoleKernel = await app.make<ConsoleKernel>(ConsoleKernel);

        const secret = await kernel.call('generate:key', []);

        expect(secret).not.toBeNull();
    });
});