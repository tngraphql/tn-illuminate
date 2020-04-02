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
import { BaseCommand, flags } from 'tn-console';

export class KeyGenerateCommand extends BaseCommand  {
    /**
     * Command name. The command will be registered using this name only. Make
     * sure their aren't any spaces inside the command name.
     */
    static commandName: string = 'generate:key';

    static description: string = 'Generate a new APP_KEY secret';

    @flags.boolean()
    public force: boolean;

    async handle(...args: any[]) {
        let secret: string = await new Promise(resolve => {
            require('crypto').randomBytes(32, function(err, buffer) {
                resolve('base64:' + buffer.toString('base64'));
            });
        })

        console.log(this.colors.green(secret));
        console.log(this.colors.gray('> During development, you may want to set the above secret as APP_KEY inside the .env file'));

        return secret;
    }

}