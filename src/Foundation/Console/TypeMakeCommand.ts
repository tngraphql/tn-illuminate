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
import { args } from 'tn-console';

export class TypeMakeCommand extends GeneratorCommand  {
    protected getSuffix(): string {
        return 'type';
    }

    protected getStub(): string {
        return path.join(__dirname, 'stub/type.stub');
    }
    /**
     * Command name. The command will be registered using this name only. Make
     * sure their aren't any spaces inside the command name.
     */
    static commandName: string = 'make:type';

    static description: string = 'Make a new graphql objectType';

    @args.string()
    public name: string;

    getDestinationPath() {
        return path.join(this.application.getBasePath(), 'app/GraphQL/Types');
    }

    async handle(...args: any[]): Promise<boolean> {
        return super.handle(...args);
    }

}