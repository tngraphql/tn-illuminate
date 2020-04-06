/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/22/2020
 * Time: 10:02 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { Kernel } from '@tngraphql/console'
import { Filesystem } from '@poppinss/dev-utils/build'
import { join } from 'path'
import { cleanup, getDb, setup } from '../validate/helpers';
import { Application } from '../../src/Foundation';
import { Facade } from '../../src/Support/Facade';
import { SeedCommand } from '../../src/Database/seed/SeedCommand';

let db: ReturnType<typeof getDb>
const fs = new Filesystem(join(__dirname, 'app'))

describe('Seed', () => {
    let app = new Application(fs.basePath);
    let kernel = new Kernel(app);

    beforeEach(async () => {
        await setup()
        db = getDb()
        app.inProduction = false
        app.environment = 'test'
        app.singleton('db', () => db)
        app.singleton('factory', () => {
            const { DBFactory } = require('../../src/Database/Factory/DBFactory')
            return new DBFactory(app)
        })
        Facade.setFacadeApplication(app)
    })
    afterEach(async () => {
        await fs.cleanup()
        await cleanup()
        await db.manager.closeAll()
    })

    test('Seed database using seed files', async () => {
        await fs.add('database/seeds/UserSeeder.ts', `
import { DBFactory } from '../../../../../src/Database/Factory/DBFactory';
import { Facade } from '../../../../../src/Support/Facade';

const Factory: DBFactory = Facade.create('factory')

Factory.blueprint('factory', () => {
  return {
    name: 'username',
  }
})

export class UserSeeder {
  public async run () {
    Factory.get('factory').create({
      name: 'nguyenpl117',
    })
  }
}
    `)

        const seed = new SeedCommand(app, kernel)
        await seed.handle()
        db = getDb()

        const seeded = await db.connection().from('factory').select('*')

        expect(seeded).toHaveLength(1);
    });

    it('should work properly when canot find files', async () => {
        await fs.add('database/seeds/index.txt', '');

        const seed = new SeedCommand(app, kernel)

        await seed.handle();

        expect(seed.logger.logs[0]).toBe('underline(blue(info)) Nothing to seed');
    });

    test('Seed database using Factory files', async () => {
        await fs.add('database/factories/UserFactory.ts', `
import { DBFactory } from '../../../../../src/Database/Factory/DBFactory';
import { Facade } from '../../../../../src/Support/Facade';

const Factory: DBFactory = Facade.create('factory')

Factory.blueprint('factory', () => {
  return {
    name: 'username',
  }
})
    `)
        await fs.add('database/seeds/UserSeeder.ts', `
import { DBFactory } from '../../../../../src/Database/Factory/DBFactory';
import { Facade } from '../../../../../src/Support/Facade';

const Factory: DBFactory = Facade.create('factory')

export class UserSeeder {
  public async run () {
    Factory.get('factory').create({
      name: 'nguyenpl117',
    })
  }
}
    `)

        const seed = new SeedCommand(app, kernel)
        await seed.handle()
        db = getDb()

        const seeded = await db.connection().from('factory').select('*')

        expect(seeded).toHaveLength(1);
    })
})
