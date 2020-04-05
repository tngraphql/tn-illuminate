/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/22/2020
 * Time: 5:26 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import * as path from 'path'
import { args } from '@tngraphql/console'
import { GeneratorCommand } from '../../Foundation/Console';

export class SeedMakeCommand extends GeneratorCommand {
  public static commandName = 'make:seeder'

  public static description = 'Create a new seeder class'

  @args.string()
  public name: string

  public getStub (): string {
    return path.join(__dirname, 'stub/seed.stub')
  }

  public getSuffix (): string {
    return 'Seeder'
  }

  public handle (): Promise<any> {
    return super.handle()
  }

  public getDestinationPath () {
    return this.application.basePath('database/seeds')
  }
}
