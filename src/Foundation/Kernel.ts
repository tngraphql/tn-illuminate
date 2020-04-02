/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/10/2020
 * Time: 2:25 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { LoadConfiguration } from './Bootstrap/LoadConfiguration';
import { LoadEnvironmentVariables } from './Bootstrap/LoadEnvironmentVariables';
import { RegisterProviders } from './Bootstrap/RegisterProviders';
import { BootProviders } from './Bootstrap/BootProviders';
import { Application } from './Application';
import { Service } from '../Decorators/Service';

@Service()
export class Kernel {
    protected bootstrappers: Function[] = [
        LoadEnvironmentVariables,
        LoadConfiguration,
        RegisterProviders,
        BootProviders
    ]

    constructor(public app: Application) {

    }

    public async handle() {
        await this.bootstrap();
    }

    public async bootstrap() {
        await this.app.bootstrapWith(this.bootstrappers);
    }
}