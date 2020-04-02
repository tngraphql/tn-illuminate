/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/21/2020
 * Time: 9:07 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { ServiceProvider } from '../Support/ServiceProvider';
import { Profiler } from '@adonisjs/profiler/build/standalone';
import * as path from "path";

export class ProfilerServiceProvider extends ServiceProvider {

    register() {
        this.app.singleton('profiler', () => {
            this.mergeConfigFrom(path.join(__dirname, './config/config'), 'profiler');

            const logger = this.app.use<any>('log');

            const profiler = new Profiler(this.app.basePath(), logger, this.app.config.get('profiler'));
        });
    }
}