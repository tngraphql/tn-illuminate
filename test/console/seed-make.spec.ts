/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/22/2020
 * Time: 10:18 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { Filesystem } from '@poppinss/dev-utils/build'
import { join } from 'path'
import { Application, ConsoleKernel } from '../../src/Foundation';
import { SeedMakeCommand } from '../../src/Database/seed/SeedMakeCommand';

const fs = new Filesystem(join(__dirname, 'app'))
const templatesFs = new Filesystem(join(__dirname, '../../src/Database/seed/stub'));
/**
 * Split string to an array using cross platform new lines
 */
function toNewlineArray (contents: string): string[] {
  return contents.split(/\r?\n/)
}


describe('Seed | make', () => {
  afterEach(async () => {
    await fs.cleanup()
  })

  test('Create a new seeder class', async () => {
    const app: any = new Application(fs.basePath)
    app.inProduction = false
    app.environment = 'test'
    const kernel = new ConsoleKernel(app)

    const make:SeedMakeCommand = new SeedMakeCommand(app, kernel.getAce())

    make.name = 'User'

    await make.handle()

    const file = app.basePath('database/seeds/User.ts')

    const schemaTemplate = await templatesFs.get('seed.stub')

    expect(toNewlineArray(await fs.get(file))).toEqual(toNewlineArray(
        schemaTemplate
            .replace('${filename}', 'User')
            .replace('${filename}', 'User'),
    ))
  })
})
