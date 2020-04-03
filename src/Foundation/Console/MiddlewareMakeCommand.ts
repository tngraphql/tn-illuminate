/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/14/2020
 * Time: 4:26 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { Application } from '../Application';
import * as path from 'path';
import { GeneratorCommand } from './GeneratorCommand';
import { args } from '@tngraphql/console';

export class MiddlewareMakeCommand extends GeneratorCommand {
    protected getSuffix(): string {
        return 'middleware';
    }
    /**
     * Command name. The command will be registered using this name only. Make
     * sure their aren't any spaces inside the command name.
     */
    static commandName: string = 'make:middleware';

    /**
     * The description of the command displayed on the help screen.
     * A good command will always have some description.
     */
    static description: string = 'Create a new middleware class';

    @args.string()
    public name: string;

    protected getStub() {
        return path.join(__dirname, 'stub/middleware.stub');
    }

    async handle(...args: any[]): Promise<boolean> {
        return super.handle(...args);
    }

    getDestinationPath() {
        return path.join(this.application.getBasePath(), 'app/GraphQL/Middleware');
    }
}
