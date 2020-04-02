import { Filesystem } from '@poppinss/dev-utils/build';
import { join } from 'path';
import { Application, GraphQLKernel } from '../../src/Foundation';
import { graphql } from 'graphql';
import _ = require('lodash');
import { cleanup, getDb, setup } from './helpers';

/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/19/2020
 * Time: 6:22 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

let fs = new Filesystem(join(__dirname, './validate_exits'));
const message = 'Giá trị đã chọn trong trường name không hợp lệ.';

describe('Exists', () => {
    let schema;
    beforeEach(async () => {

    });
    afterEach(async () => {
    });

    afterAll(async () => {
        await fs.cleanup();
        await cleanup();
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
        import { Arg, Mutation, Query, Resolver } from 'tn-graphql';
import { ValidateArgs } from '../../../../src/Decorators/ValidateArgs';
import { Rule } from '../../../../src/Foundation/Validate/Rule';

@Resolver()
export class UserResolve {
    @Query()
    @ValidateArgs({
        name: [
            Rule.exists('users', 'name').where(query => {
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
            Rule.exists('users', 'name')
        ],
    })
    passExistsMutation(@Arg('name') name: string): string {
        return 'nguyen';
    }

    @Mutation()
    @ValidateArgs({
        name: [
            Rule.exists('users', 'name')
        ],
    })
    fallExistsMutation(@Arg('name') name: string): string {
        return 'nguyen';
    }

    @Mutation()
    @ValidateArgs({
        name: [
            Rule.exists('users', 'name').whereNull('id')
        ],
    })
    existsWhereNullMutation(@Arg('name') name: string): string {
        return 'nguyen';
    }

    @Mutation()
    @ValidateArgs({
        name: [
            Rule.exists('users', 'name').whereNotNull('id')
        ],
    })
    existsWhereNotNullMutation(@Arg('name') name: string): string {
        return 'nguyen';
    }

    @Mutation()
    @ValidateArgs({
        name: [
            Rule.exists('users', 'name').whereNot('id', '1')
        ],
    })
    existsWhereNotMutation(@Arg('name') name: string): string {
        return 'nguyen';
    }

    @Mutation()
    @ValidateArgs({
        name: [
            Rule.exists('users', 'name').where('id', 1)
        ],
    })
    existsWhereValueMutation(@Arg('name') name: string): string {
        return 'nguyen';
    }

    @Mutation()
    @ValidateArgs({
        name: [
            Rule.exists('users', 'name').where(query => {
                query.where('id', 1);
            })
        ],
    })
    existsWhereCallbackMutation(@Arg('name') name: string): string {
        return 'nguyen';
    }

    @Mutation()
    @ValidateArgs({
        name: [
            Rule.exists('users', 'name').where(query => {
                query.where('id', 1);
            }).where(query => {
                query.where('id', 2);
            })
        ],
    })
    existsWhereMultipleCallbackMutation(@Arg('name') name: string): string {
        return 'nguyen';
    }

    @Mutation()
    @ValidateArgs({
        name: [
            Rule.exists('users', 'name').whereIn('id', [1, 2])
        ],
    })
    existsWhereInMutation(@Arg('name') name: string): string {
        return 'nguyen';
    }

    @Mutation()
    @ValidateArgs({
        name: [
            Rule.exists('users', 'name').whereNotIn('id', [1, 2])
        ],
    })
    existsWhereNotInMutation(@Arg('name') name: string): string {
        return 'nguyen';
    }
}          
            `);
        await fs.add('start/route.ts', `
            import { Route } from '../../../../src/Support/Facades';
            
            Route.group(() => {
                Route.query('index', 'UserResolve.index');

                Route.mutation('passExistsMutation', 'UserResolve.passExistsMutation');
                Route.mutation('fallExistsMutation', 'UserResolve.fallExistsMutation');
                Route.mutation('existsWhereNullMutation', 'UserResolve.existsWhereNullMutation');
                Route.mutation('existsWhereNotNullMutation', 'UserResolve.existsWhereNotNullMutation');
                Route.mutation('existsWhereNotMutation', 'UserResolve.existsWhereNotMutation');
                Route.mutation('existsWhereValueMutation', 'UserResolve.existsWhereValueMutation');
                // Route.mutation('existsWhereMutation', 'UserResolve.existsWhereMutation');
                Route.mutation('existsWhereCallbackMutation', 'UserResolve.existsWhereCallbackMutation');
                Route.mutation('existsWhereMultipleCallbackMutation', 'UserResolve.existsWhereMultipleCallbackMutation');
                Route.mutation('existsWhereInMutation', 'UserResolve.existsWhereInMutation');
                Route.mutation('existsWhereNotInMutation', 'UserResolve.existsWhereNotInMutation');

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

    it('pass exists validate', async () => {
        const query = `mutation {
            passExistsMutation(name:"nguyen")
          }`;

        const res = await graphql(schema, query);

        expect(res.errors).toBe(undefined);
    });

    it('fall exists validate', async () => {
        const query = `mutation {
            fallExistsMutation(name:"nguyen2")
          }`;

        const res = await graphql(schema, query);

        expect(_.get((res.errors[0].originalError as any).getValidatorMessages(), 'name.0')).toBe(message)
    });

    it('where not value', async () => {
        const query = `mutation {
            existsWhereNotMutation(name:"nguyen")
          }`;

        const res = await graphql(schema, query);
        expect(_.get((res.errors[0].originalError as any).getValidatorMessages(), 'name.0')).toBe(message)
    });

    it('where is null', async () => {
        const query = `mutation {
            existsWhereNullMutation(name:"nguyen")
          }`;

        const res = await graphql(schema, query);
        expect(_.get((res.errors[0].originalError as any).getValidatorMessages(), 'name.0')).toBe(message)
    });

    it('where is not null', async () => {
        const query = `mutation {
            existsWhereNotNullMutation(name:"nguyen")
          }`;

        const res = await graphql(schema, query);

        expect(res.errors).toBe(undefined);
    });

    it('where value', async () => {
        const query = `mutation {
            existsWhereValueMutation(name:"nguyen")
          }`;

        const res = await graphql(schema, query);
        expect(res.errors).toBe(undefined);
    });

    it('where use callback', async () => {
        const query = `mutation {
            existsWhereCallbackMutation(name:"nguyen")
          }`;

        const res = await graphql(schema, query);
        expect(res.errors).toBe(undefined);
    });

    it('where use multiple callback', async () => {
        const query = `mutation {
            existsWhereMultipleCallbackMutation(name:"nguyen")
          }`;

        const res = await graphql(schema, query);
        expect(_.get((res.errors[0].originalError as any).getValidatorMessages(), 'name.0')).toBe(message)
    });

    it('where in', async () => {
        const query = `mutation {
            existsWhereInMutation(name:"nguyen")
          }`;

        const res = await graphql(schema, query);
        expect(res.errors).toBe(undefined);
    });

    it('where not in', async () => {
        const query = `mutation {
            existsWhereNotInMutation(name:"nguyen")
          }`;

        const res = await graphql(schema, query);
        expect(_.get((res.errors[0].originalError as any).getValidatorMessages(), 'name.0')).toBe(message)
    });
});
