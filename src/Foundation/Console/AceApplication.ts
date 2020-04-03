/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/14/2020
 * Time: 2:58 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { Kernel as ConsoleKernel } from '@tngraphql/console';
import { Application } from '../Application';

export class AceApplication extends ConsoleKernel {
    static bootstrappers = [];

    constructor(application?: Application) {
        super(application);

        this.bootstrap();
    }

    async call(command: string, args: any[]): Promise<any> {
        return this.exec(command, args);
    }

    static starting(callback: (ace: AceApplication) => void) {
        this.bootstrappers.push(callback);
    }

    /**
     * Bootstrap the console application.
     *
     */
    protected bootstrap() {
        const bootstrappers = (this.constructor as any).bootstrappers;
        for( const bootstrapper of bootstrappers ) {
            bootstrapper(this);
        }
    }

    /**
     * Clear the console application bootstrappers.
     */
    public static forgetBootstrappers() {
        this.bootstrappers = [];
    }
}
