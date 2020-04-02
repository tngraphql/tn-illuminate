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
import { CommandMakeCommand } from '../../src/Foundation/Console/CommandMakeCommand';
import { Filesystem } from '@poppinss/dev-utils/build';
import { join } from "path";

const fs = new Filesystem(join(__dirname, './cammand'))
describe('Command Make', () => {

    afterEach(async () => {
        jest.resetModules();
        await fs.cleanup();
    });

    beforeAll(async () => {
        AceApplication.starting(ace => {
            ace.register([CommandMakeCommand]);
        });
    });

    beforeEach(async () => {
        await fs.add('config/app.ts', `export default {
            providers: []
        }`);
    })

    it('make a new command', async () => {
        const app = new Application(fs.basePath);

        const kernel: ConsoleKernel = await app.make<ConsoleKernel>(ConsoleKernel);

        await kernel.call('make:command', ['user']);

        expect(await fs.get('app/Console/Commands/User.ts')).toMatchSnapshot()
    });
});