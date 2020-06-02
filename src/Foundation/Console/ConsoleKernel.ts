import { Service } from '../../Decorators/Service';
import { BaseCommand, } from '@tngraphql/console';
import _ = require('lodash');
import { AceApplication as Ace } from './AceApplication';
import { Application } from '../Application';
import { LoadConfiguration } from '../Bootstrap/LoadConfiguration';
import { LoadEnvironmentVariables } from '../Bootstrap/LoadEnvironmentVariables';
import { RegisterProviders } from '../Bootstrap/RegisterProviders';
import { BootProviders } from '../Bootstrap/BootProviders';
import { RegisterFacades } from '../Bootstrap/RegisterFacades';
import { ClassType } from '@tngraphql/graphql';

/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/14/2020
 * Time: 7:04 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

@Service()
export class ConsoleKernel {
    protected commands: any[] = [];

    protected ace: any;

    protected bootstrappers: Function[] = [
        LoadEnvironmentVariables,
        LoadConfiguration,
        RegisterFacades,
        RegisterProviders,
        BootProviders,
    ];

    constructor(public app: Application) {

    }

    public async handle() {
        try {
            await this.bootstrap();
            await this.getAce().handle(process.argv.splice(2));
        } catch (e) {
            console.log(e);
        }
        process.exit();
    }

    public async bootstrap() {
        if (! this.app.hasBeenBootstrapped()) {
            await this.app.bootstrapWith(this.bootstrappers);
        }
    }

    public registerCommand(command: ClassType<BaseCommand> | ClassType<BaseCommand>[]) {
        this.getAce().register(_.toArray(command));
    }

    public async call(command: string, args: any[]) {
        await this.bootstrap();
        return this.getAce().call(command, args);
    }

    public getAce(): Ace {
        if ( ! this.ace ) {
            return this.ace = new Ace(this.app).register(this.commands);
        }
        return this.ace;
    }

    public setAce(ace) {
        this.ace = ace;
    }
}
