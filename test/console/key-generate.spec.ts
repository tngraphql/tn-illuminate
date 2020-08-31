/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/15/2020
 * Time: 7:23 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {AceApplication, Application, ConsoleKernel, LoadConfiguration} from '../../src/Foundation';
import { Filesystem } from '@poppinss/dev-utils/build';
import { join } from "path";
import { KeyGenerateCommand } from '../../src/Foundation/Console/KeyGenerateCommand';
import {Repository} from "../../src";

const fs = new Filesystem(join(__dirname, './key'))

describe('Generate Key', () => {
    beforeEach(async () => {
        await fs.add('.env', ``);
        AceApplication.starting(ace => {
            ace.register([KeyGenerateCommand]);
        });

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

        const root = process.cwd();
        process.chdir(join(__dirname, './key'));

        const secret = await kernel.call('generate:key', []);
        process.chdir(root);
        expect(secret).not.toBeNull();
    });

    it('set application key', async () => {
        const app = new Application(fs.basePath);
        app.environment = 'test'
        new LoadConfiguration().bootstrap(app);
        const config = await app.make<Repository>('config').set('app', {
            cipher: 'AES-256-CBC'
        });

        const kernel: ConsoleKernel = await app.make<ConsoleKernel>(ConsoleKernel);

        const keyGenerate = new KeyGenerateCommand(app, kernel.getAce());

        const root = process.cwd();
        process.chdir(join(__dirname, './key'));

        const secret = await keyGenerate.handle();
        process.chdir(root);

        const log = keyGenerate.logger.logs[0];

        expect(log).toBe(keyGenerate.logger.success(keyGenerate.colors.green('Đặt khóa ứng dụng thành công.')))
        expect(secret).not.toBeNull();
    });

    it('show key', async () => {
        const app = new Application(fs.basePath);
        app.environment = 'test'
        new LoadConfiguration().bootstrap(app);
        const config = await app.make<Repository>('config').set('app', {
            cipher: 'AES-256-CBC'
        });

        const kernel: ConsoleKernel = await app.make<ConsoleKernel>(ConsoleKernel);

        const keyGenerate = new KeyGenerateCommand(app, kernel.getAce());

        const root = process.cwd();
        process.chdir(join(__dirname, './key'));
        keyGenerate.show = true;
        const secret = await keyGenerate.handle();
        process.chdir(root);

        const log = keyGenerate.logger.logs[0];

        expect(log).not.toBe(keyGenerate.logger.success(keyGenerate.colors.green('Đặt khóa ứng dụng thành công.')))
        expect(secret).not.toBeNull();
    });
});