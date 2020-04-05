/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/24/2020
 * Time: 11:22 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Application } from '../../src/Foundation';
import { DatabaseServiceProvider } from '../../src/Database/DatabaseServiceProvider';
import { Facade } from '../../src/Support/Facade';
import { Factory } from '../../src/Support/Facades';
import { DBFactory } from '../../src/Database/Factory/DBFactory';
import { ModelFactory } from '../../src/Database/Factory/ModelFactory';
import { cleanup, getDb, setup } from '../validate/helpers';
import { DatabaseFactory } from '../../src/Database/Factory/DatabaseFactory';
import { Adapter, BaseModel, column } from '../../src/Contracts/database/aliases';
import { chance } from '../../src/Database/Factory/chance';

let db: ReturnType<typeof getDb>
let app
describe('Factory', () => {
    describe('Factory | init', () => {
        it('init factory', async () => {
            const app = new Application();
            await app.register(new DatabaseServiceProvider(app));
            const factory = app.use('factory');

            expect(factory).toBeInstanceOf(DBFactory);
        });

        it('init facades factory', async () => {
            const app = new Application();
            await app.register(new DatabaseServiceProvider(app));
            Facade.setFacadeApplication(app);
            Factory.blueprint('users', () => {
            })

            expect(Factory.getBlueprint('users').name).toBe('users');
        });
    });

    describe('Database | Factory', () => {
        test('Register a new blueprint with model or table name', async () => {
            const fact: any = new DBFactory()
            fact.blueprint('user', () => {
            })

            expect(fact._blueprints).toHaveLength(1);
            expect(fact._blueprints[0].name).toBe('user');
            expect(fact.getBlueprint('user')).not.toBeNull();
        })

        test('should clear all the registered blueprints.', async () => {
            const fact: any = new DBFactory()
            fact.blueprint('user', () => {
            })
            fact.clear()
            expect(fact._blueprints).toHaveLength(0);
        })

        test('Get model factory for a registered blueprint.', async () => {
            const fact = new DBFactory()
            fact.blueprint('user', () => {
            })

            expect(fact.model('user')).toBeInstanceOf(ModelFactory);
        })

        test('Get database factory instance for a registered blueprint', async () => {
            const fact = new DBFactory()
            fact.blueprint('user', () => {
            })
            expect(fact.get('user')).toBeInstanceOf(DatabaseFactory);
        })
    });
    describe('Factory | database', () => {
        beforeEach(async () => {
            await setup()

            db = getDb()
            app = new Application()
            app.singleton('db', () => db)
            BaseModel.$adapter = new Adapter(db)
            BaseModel.$container = app;

            class User extends BaseModel {
                public static table = 'factory'

                @column({ isPrimary: true })
                public id: string

                @column()
                public name: string
            }

            app.singleton('App/Models/User', () => User)
        })

        afterEach(async () => {
            await db.manager.closeAll()
            await cleanup()
        })

        test('Make a single model instance with attributes from blueprint fake values', async () => {
            const factory = new DatabaseFactory(app, 'factory', () => {
                return {
                    name: 'user',
                }
            })

            const user: any = await factory.make()

            expect(user.name).toBe('user');
        })

        test('make many data', async () => {
            const factory = new DatabaseFactory(app, 'factory', (faker, index, data) => {
                return {
                    name: data[index as number].name || faker.username(),
                }
            })

            const users: any = await factory.makeMany(2, [{ name: 'user' }, { name: 'user2' }])

            expect(users[0].name).toBe('user');
            expect(users[1].name).toBe('user2');
        })

        test('Create model instance and persist to database and then return it back', async () => {
            const factory = new DatabaseFactory(app, 'factory', () => {
                return {
                    name: 'user',
                }
            })

            const user: any = await factory.create()

            expect(user).toHaveLength(1);
        })

        test('Persist multiple model instances to database and get them back as an array', async () => {
            const factory = new DatabaseFactory(app, 'factory', () => {
                return {
                    name: 'user',
                }
            })

            const user: any = await factory.createMany(2)

            expect(user).toHaveLength(2);
        })

        test('Set table to used for the database', async () => {
            const factory = new DatabaseFactory(app, 'user', () => {
                return {
                    name: 'user',
                }
            })

            const user: any = await factory.table('factory').createMany(2)

            expect(user).toHaveLength(2);
        })

        test('Specify the connection to be used on the query builder', async () => {
            const factory = new DatabaseFactory(app, 'user', () => {
                return {
                    name: 'user',
                }
            })

            const user: any = await factory.connection('primary').table('factory').createMany(2)
            expect(user).toHaveLength(2);
        })

        test('Truncate the database table', async () => {
            const factory = new DatabaseFactory(app, 'factory', () => {
                return {
                    name: 'user',
                }
            })

            await factory.createMany(2)

            await factory.reset()

            const users = await db.connection().from('factory').select('*')
            expect(users).toHaveLength(0);
        })
    });
    describe('Factory | Model', () => {
        beforeEach(async () => {
            await setup()

            app = new Application()
            db = getDb()
            app.singleton('db', () => db)

            BaseModel.$adapter = new Adapter(db)
            BaseModel.$container = app;

            class User extends BaseModel {
                public static table = 'factory'

                @column({ isPrimary: true })
                public id: string

                @column()
                public name: string
            }

            app.singleton('App/Models/User', () => User)
        })
        afterEach(async () => {
            await db.manager.closeAll()
            await cleanup()
        })

        test('Create model instance and persist to database and then return it back', async () => {
            const model = new ModelFactory(app, 'App/Models/User', () => {
                return {
                    name: 'nguyen23',
                }
            })

            const user = await model.create()

            const created = await db.connection().from('factory').select('*')

            expect(user.name).toBe('nguyen23');
            expect(created).toHaveLength(1);
        })

        test('Persist multiple model instances to database and get them back as an array', async () => {
            const model = new ModelFactory(app, 'App/Models/User', () => {
                return {
                    name: 'nguyen23',
                }
            })

            const users: any = await model.createMany(2)

            const created = await db.connection().from('factory').select('*')

            expect(users).toHaveLength(2);
            expect(created).toHaveLength(2);
            expect(users[0].name).toBe('nguyen23');
        })

        test('Make a single model instance with attributes from blueprint fake values', async () => {
            const model = new ModelFactory(app, 'App/Models/User', () => {
                return {
                    name: 'nguyen23',
                }
            })

            const user = await model.make()

            expect(user.toJSON()).toEqual({ name: 'nguyen23' });
        })

        test('Make x number of model instances with fake data', async () => {
            const model = new ModelFactory(app, 'App/Models/User', () => {
                return {
                    name: 'nguyen23',
                }
            })

            const users: any = await model.makeMany(2)

            expect(users[0].name).toBe('nguyen23');
            expect(users[1].name).toBe('nguyen23');
        })

        test('make a custom data', async () => {
            const model = new ModelFactory(app, 'App/Models/User', (faker, i, data) => {
                return {
                    name: data.name || 'nguyen23' || faker.username() || i,
                }
            })

            const user = await model.make({ name: 'user' })

            expect(user.toJSON()).toEqual({ name: 'user' });
        })

        test('make a faker data', async () => {
            const model = new ModelFactory(app, 'App/Models/User', (faker, i, data) => {
                return {
                    name: faker.username() || data.name || i,
                }
            })

            const user = await model.make({ name: 'user' })

            expect(user.name).toBeDefined();
        })

        test('make many custom data', async () => {
            const model = new ModelFactory(app, 'App/Models/User', (faker, i, data) => {
                return {
                    name: data[i as number].name || 'nguyen23' || faker.username(),
                }
            })

            const users: any = await model.makeMany(2, [{ name: 'user' }, { name: 'user2' }])

            expect(users[0].name).toBe('user');
            expect(users[1].name).toBe('user2');
        })

        test('Truncate the database table', async () => {
            const model = new ModelFactory(app, 'App/Models/User', () => {
                return {
                    name: 'nguyen23',
                }
            })

            await model.create()

            await model.reset()

            const users = await db.connection().from('factory').select('*')

            expect(users).toHaveLength(0);
        })
    });

    describe('chance', () => {
        it('username', async () => {
            expect(chance.username(10)).toHaveLength(10);
            expect(chance.username(10)).not.toBe(chance.username(10));
        });

        it('password', async () => {
            expect(chance.password(10)).toHaveLength(10);
            expect(chance.password(10)).not.toBe(chance.password(10));
        });
    });
});
