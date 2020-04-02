/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/23/2020
 * Time: 10:12 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/15/2020
 * Time: 7:41 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Filesystem } from '@poppinss/dev-utils/build';
import { join } from "path";
import { AceApplication, ConsoleKernel, MigrateMakeCommand } from '../../src/Foundation/Console';
import { Application } from '../../src/Foundation';

const fs = new Filesystem(join(__dirname, './migrate'))

describe('Migrate Make', () => {

    afterEach(async () => {
        jest.resetModules();
        await fs.cleanup();
    });

    beforeAll(async () => {
        await fs.add('.env', ``);
        AceApplication.starting(ace => {
            ace.register([MigrateMakeCommand]);
        });
    });

    beforeEach(async () => {
        await fs.add('config/app.ts', `export default {
            providers: []
        }`);
    })

    it('make a new migrate', async () => {
        const app = new Application(fs.basePath);
        app.environment = 'test';

        const kernel: ConsoleKernel = await app.make<ConsoleKernel>(ConsoleKernel);

        const argv = ['make:migration', 'user']
        const command = await kernel.getAce().find(argv)
        const commandInstance = new command!(app)
        await kernel.getAce().runCommand(commandInstance, argv)

        expect(commandInstance.logger.logs[0].startsWith('underline(green(create))')).toBe(true);

        expect(await fs.get(commandInstance.logger.logs[0].replace('underline(green(create)) ', ''))).toMatchSnapshot()
    });
});