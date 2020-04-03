/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/14/2020
 * Time: 4:26 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { GeneratorCommand } from './GeneratorCommand';
import * as path from 'path';
import { args } from '@tngraphql/console';

export class CommandMakeCommand extends GeneratorCommand  {
    protected getSuffix(): string {
        return 'command';
    }

    protected getStub(): string {
        return path.join(__dirname, 'stub/command.stub');
    }
    /**
     * Command name. The command will be registered using this name only. Make
     * sure their aren't any spaces inside the command name.
     */
    static commandName: string = 'make:command';

    static description: string = 'Make a new ace command';

    @args.string()
    public name: string;

    async handle(...args: any[]): Promise<boolean> {
        return super.handle(...args);
    }

    getDestinationPath() {
        return path.join(this.application.getBasePath(), 'app/Console/Commands');
    }
}
