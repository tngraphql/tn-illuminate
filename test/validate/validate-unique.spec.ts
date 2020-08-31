import { Filesystem } from '@poppinss/dev-utils/build';
import { join } from 'path';
import { Application, GraphQLKernel, LoadConfiguration } from '../../src/Foundation';
import { graphql } from 'graphql';
import _ = require('lodash');
import { cleanup, getDb, setup } from './helpers';
import { Factory } from '../../src/Foundation/Validate/Factory';
import { DatabasePresenceVerifier } from '../../src/Foundation/Validate/DatabasePresenceVerifier';
import { Rule } from '../../src/Foundation/Validate/Rule';

/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/19/2020
 * Time: 6:22 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

let fs = new Filesystem(join(__dirname, './validate_unique'));
const message = 'Trường name đã có trong cơ sở dữ liệu.';

describe('Unique', () => {
    describe('Validate', () => {
        let app;
        let validator;
        let db;
        let verifier;
        beforeAll(async () => {
            app = new Application();
            (new LoadConfiguration()).bootstrap(app);
            validator = new Factory(app);
            db = getDb();
            verifier = new DatabasePresenceVerifier(db);
            validator.setPresenceVerifier(verifier);

            await setup();
            await db.table('users').insert([
                {
                    name: 'nguyen2',
                },
                {
                    name: 'nguyen3',
                }
            ]);
        });

        afterAll(async () => {
            await cleanup();
        });

        it('should have validate a geven wildcard passes', async () => {

            const validation = validator.make({ name: 'nguyen1', }, {
                name: 'unique:users,name'
            });

            expect(await validator.checkValidate(validation)).toBeTruthy();

            {
                // ignore id = 1
                const validation = validator.make({ name: 'nguyen', }, {
                    name: 'unique:users,name,1'
                });

                expect(await validator.checkValidate(validation)).toBeTruthy();
            }
            {
                // ignore name = nguyen
                const validation = validator.make({ name: 'nguyen', }, {
                    name: 'unique:users,name,nguyen,name'
                });

                expect(await validator.checkValidate(validation)).toBeTruthy();
            }

        });

        it('should have validate a geven rule passes', async () => {

            {
                const validation = validator.make({ name: 'nguyen1', }, {
                    name: [Rule.unique('users', 'name')]
                });

                expect(await validator.checkValidate(validation)).toBeTruthy();
            }
            {
                const validation = validator.make({ name: 'nguyen', }, {
                    name: [Rule.unique('users', 'name').ignore(1)]
                });

                expect(await validator.checkValidate(validation)).toBeTruthy();
            }
            {
                const validation = validator.make({ name: 'nguyen', }, {
                    name: [Rule.unique('users', 'name').ignore('nguyen', 'name')]
                });

                expect(await validator.checkValidate(validation)).toBeTruthy();
            }
        });

        it('should have validate a geven wildcard fails', async () => {

            const validation = validator.make({ name: 'nguyen', }, {
                name: 'unique:users,name'
            });

            expect(await validator.checkValidate(validation)).toBeFalsy();
        });

        it('should have validate a geven many value passes', async () => {
            const validation = validator.make({ name: ['nguyen1', 'nguyen0'], }, {
                name: 'unique:users,name'
            });

            expect(await validator.checkValidate(validation)).toBeTruthy();
        });

        it('should have validate a geven many value fails', async () => {

            const validation = validator.make({ name: ['nguyen1', 'nguyen3'], }, {
                name: 'unique:users,name'
            });

            expect(await validator.checkValidate(validation)).toBeFalsy();
        });
    });

    describe('GraphQL', () => {
        let schema;
        beforeEach(async () => {

        });
        afterEach(async () => {

        });

        afterAll(async () => {
            await fs.cleanup();
            await cleanup()
        })

        beforeAll(async () => {
            await setup()
            await fs.add('config/app.ts', `
    import { RouterServiceProvider } from '../RouterServiceProvider';
import { DatabaseServiceProvider } from '../../../../src/Database/DatabaseServiceProvider';
import { ValidatorServiceProvider } from '../../../../src/Foundation/Validate/ValidatorServiceProvider';

export default {
    name: 'test',
    providers: [
        RouterServiceProvider,
        DatabaseServiceProvider,
        ValidatorServiceProvider
    ]
}
            
            `);
            await fs.add('app/UserResolve.ts', `
        import { Arg, Mutation, Query, Resolver } from '@tngraphql/graphql';
import { ValidateArgs } from '../../../../src/Decorators/ValidateArgs';
import { Rule } from '../../../../src/Foundation/Validate/Rule';
   @Resolver()
export class UserResolve {
    @Query()
    @ValidateArgs({
        name: [
            Rule.unique('users', 'name').where(query => {
                query.where('id', 1);
            }).where(function(query) {
                // query.where('id', 2);
            })
        ],
    })
    index(@Arg('name') name: string): string {
        return 'nguyen';
    }
    
        @Mutation()
    @ValidateArgs({
        name: [
            Rule.unique('users', 'name').ignore(1)
        ],
    })
    passUniqueMutation(@Arg('name') name: string): string {
        return 'nguyen';
    }

    @Mutation()
    @ValidateArgs({
        name: [
            Rule.unique('users', 'name')
        ],
    })
    fallUniqueMutation(@Arg('name') name: string): string {
        return 'nguyen';
    }

    @Mutation()
    @ValidateArgs({
        name: [
            Rule.unique('users', 'name').whereNull('id')
        ],
    })
    uniqueWhereNullMutation(@Arg('name') name: string): string {
        return 'nguyen';
    }
    @Mutation()
    @ValidateArgs({
        name: [
            Rule.unique('users', 'name').whereNotNull('id')
        ],
    })
    uniqueWhereNotNullMutation(@Arg('name') name: string): string {
        return 'nguyen';
    }
    @Mutation()
    @ValidateArgs({
        name: [
            Rule.unique('users', 'name').whereNot('id', '1')
        ],
    })
    uniqueWhereNotMutation(@Arg('name') name: string): string {
        return 'nguyen';
    }
    @Mutation()
    @ValidateArgs({
        name: [
            Rule.unique('users', 'name').where('id', 1)
        ],
    })
    uniqueWhereValueMutation(@Arg('name') name: string): string {
        return 'nguyen';
    }

    /*@Mutation()
    @ValidateArgs({
        name: [
            Rule.unique('users', 'name').where('id', '>', 1)
        ],
    })
    uniqueWhereMutation(@Arg('name') name: string): string {
        return 'nguyen';
    }*/

    @Mutation()
    @ValidateArgs({
        name: [
            Rule.unique('users', 'name').where(query => {
                query.where('id', 1);
            })
        ],
    })
    uniqueWhereCallbackMutation(@Arg('name') name: string): string {
        return 'nguyen';
    }

    @Mutation()
    @ValidateArgs({
        name: [
            Rule.unique('users', 'name').where(query => {
                query.where('id', 1);
            }).where(query => {
                query.where('id', 2);
            })
        ],
    })
    uniqueWhereMultipleCallbackMutation(@Arg('name') name: string): string {
        return 'nguyen';
    }
    @Mutation()
    @ValidateArgs({
        name: [
            Rule.unique('users', 'name').whereIn('id', [1, 2])
        ],
    })
    uniqueWhereInMutation(@Arg('name') name: string): string {
        return 'nguyen';
    }

    @Mutation()
    @ValidateArgs({
        name: [
            Rule.unique('users', 'name').whereNotIn('id', [1,2])
        ],
    })
    uniqueWhereNotInMutation(@Arg('name') name: string): string {
        return 'nguyen';
    }
  }          
            `);
            await fs.add('start/route.ts', `
            import { Route } from '../../../../src/Support/Facades';
            
            Route.group(() => {
                Route.query('index', 'UserResolve.index');

                Route.mutation('passUniqueMutation', 'UserResolve.passUniqueMutation');
                Route.mutation('fallUniqueMutation', 'UserResolve.fallUniqueMutation');
                Route.mutation('uniqueWhereNullMutation', 'UserResolve.uniqueWhereNullMutation');
                Route.mutation('uniqueWhereNotNullMutation', 'UserResolve.uniqueWhereNotNullMutation');
                Route.mutation('uniqueWhereNotMutation', 'UserResolve.uniqueWhereNotMutation');
                Route.mutation('uniqueWhereValueMutation', 'UserResolve.uniqueWhereValueMutation');
                // Route.mutation('uniqueWhereMutation', 'UserResolve.uniqueWhereMutation');
                Route.mutation('uniqueWhereCallbackMutation', 'UserResolve.uniqueWhereCallbackMutation');
                Route.mutation('uniqueWhereMultipleCallbackMutation', 'UserResolve.uniqueWhereMultipleCallbackMutation');
                Route.mutation('uniqueWhereInMutation', 'UserResolve.uniqueWhereInMutation');
                Route.mutation('uniqueWhereNotInMutation', 'UserResolve.uniqueWhereNotInMutation');

            }).namespace('App')
            
            export = Route;
        `);
            await fs.add('RouterServiceProvider.ts', `
           import { RoutingServiceProvider } from '../../../src/Foundation/Routing/RoutingServiceProvider';
export class RouterServiceProvider extends RoutingServiceProvider {
    _namespace = 'App';
    
    map() {
        require(this.app.basePath('start/route'));
    }
}
        
        `);

            const app = new Application(fs.basePath);

            const kernel: GraphQLKernel = await app.make<GraphQLKernel>(GraphQLKernel);

            app.autoload(join(fs.basePath, 'app'), 'App');

            await kernel.handle();

            schema = await kernel.complie();
        })

        it('pass unique validate', async () => {
            const query = `mutation {
            passUniqueMutation(name:"nguyen")
          }`;

            const res = await graphql(schema, query);

            expect(res.errors).toBe(undefined);
        });

        it('fall unique validate', async () => {
            const query = `mutation {
            fallUniqueMutation(name:"nguyen")
          }`;

            const res = await graphql(schema, query);

            expect(_.get((res.errors[0].originalError as any).errors(), 'name.0')).toBe(message)
        });

        it('where not value', async () => {
            const query = `mutation {
            uniqueWhereNotMutation(name:"nguyen")
          }`;

            const res = await graphql(schema, query);
            expect(res.errors).toBe(undefined);
        });

        it('where is null', async () => {
            const query = `mutation {
            uniqueWhereNullMutation(name:"nguyen")
          }`;

            const res = await graphql(schema, query);
            expect(res.errors).toBe(undefined);

        });

        it('where is not null', async () => {
            const query = `mutation {
            uniqueWhereNotNullMutation(name:"nguyen")
          }`;

            const res = await graphql(schema, query);

            expect(_.get((res.errors[0].originalError as any).errors(), 'name.0')).toBe(message)
        });

        it('where value', async () => {
            const query = `mutation {
            uniqueWhereValueMutation(name:"nguyen")
          }`;

            const res = await graphql(schema, query);
            expect(_.get((res.errors[0].originalError as any).errors(), 'name.0')).toBe(message)
        });

        /*it('where column,operator,value', async () => {
            const query = `mutation {
                uniqueWhereMutation(name:"nguyen")
              }`;

            const res = await graphql(schema, query);
            expect(res.errors).toBe(undefined);
        });*/

        it('where use callback', async () => {
            const query = `mutation {
            uniqueWhereCallbackMutation(name:"nguyen")
          }`;

            const res = await graphql(schema, query);
            expect(_.get((res.errors[0].originalError as any).errors(), 'name.0')).toBe(message)
        });

        it('where use multiple callback', async () => {
            const query = `mutation {
            uniqueWhereMultipleCallbackMutation(name:"nguyen")
          }`;

            const res = await graphql(schema, query);
            expect(res.errors).toBe(undefined);
        });

        it('where in', async () => {
            const query = `mutation {
            uniqueWhereInMutation(name:"nguyen")
          }`;

            const res = await graphql(schema, query);
            expect(_.get((res.errors[0].originalError as any).errors(), 'name.0')).toBe(message)
        });

        it('where not in', async () => {
            const query = `mutation {
            uniqueWhereNotInMutation(name:"nguyen")
          }`;

            const res = await graphql(schema, query);
            expect(res.errors).toBe(undefined);
        });
    });
});
