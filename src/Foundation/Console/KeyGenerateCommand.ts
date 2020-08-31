/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/14/2020
 * Time: 4:26 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as path from 'path';
import {BaseCommand, flags} from '@tngraphql/console';
import {Encrypter} from "../../Encryption/Encrypter";
import * as fs from "fs";
import {Application} from "../Application";

export class KeyGenerateCommand extends BaseCommand {
    /**
     * Command name. The command will be registered using this name only. Make
     * sure their aren't any spaces inside the command name.
     */
    static commandName: string = 'generate:key';

    static description: string = 'Generate a new APP_KEY secret';

    @flags.boolean()
    public force: boolean;

    @flags.boolean()
    public show: boolean;

    application: Application;

    async handle(...args: any[]) {
        let key: string = this.generateRandomKey();

        if (this.show) {
            this.logger.complete(this.colors.yellow(key));
            return;
        }

        if (!await this.setKeyInEnvironmentFile(key)) {
            return;
        }
        ;

        this.application.make('config').set('app.key', key);

        // console.log(this.colors.green(key));
        // console.log(this.colors.gray('> During development, you may want to set the above key as APP_KEY inside the .env file'));
        this.logger.success(this.colors.green('Đặt khóa ứng dụng thành công.'));

        return key;
    }

    protected generateRandomKey(): string {
        return 'base64:' + Encrypter.generateKey(this.application.make('config').get('app.cipher')).toString('base64');
    }

    protected async setKeyInEnvironmentFile(key: string): Promise<boolean> {
        let file_env: any = fs.readFileSync(this.application.environmentFilePath());

        let str = file_env.toString('UTF-8');

        const regex = /APP_KEY=(.*)/g;
        let m;

        if (regex.exec(str) === null) {
            str = str + '\nAPP_KEY=';
        }

        while ((m = regex.exec(str)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            if (m[1] && !this.force) {
                // code
                this.logger.info("Ứng dụng này đã tồn tại khóa. Bạn muốn tạo key mới thì sử dụng option --force");
                return false;
            }
        }

        fs.writeFileSync(
            this.application.environmentFilePath(),
            str.replace(/(APP_KEY=(.*))/ig, `APP_KEY=${key}`),
            'utf8');

        return true;
    }
}
