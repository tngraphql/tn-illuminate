/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/21/2020
 * Time: 6:37 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { ServiceProvider } from '../Support/ServiceProvider';
import { Logger } from '@adonisjs/logger/build/src/Logger';
import * as path from "path";
import { LoggerConfigContract } from '../Contracts/Log/LoggerConfigContract';

export class LogServiceProvider extends ServiceProvider {

    register() {
        this.app.singleton('log', () => {
            this.mergeConfigFrom(path.join(__dirname, './config/config'), 'logger');

            return new Logger(this.app.config.get('logger') as LoggerConfigContract);
        });
    }
}