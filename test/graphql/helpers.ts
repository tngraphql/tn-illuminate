import { Filesystem } from '@poppinss/dev-utils/build';

/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/15/2020
 * Time: 9:38 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export async function initProject(fs: Filesystem) {
    await fs.add('config/app.ts', `
    import { RouterServiceProvider } from '../RouterServiceProvider';
                export default {
                    name: 'test',
                    providers: [
                    RouterServiceProvider
                    ]
                }
            `);
    await fs.add('.env', ``);
    await fs.add('app/UserResolve.ts', `
        import { Query, Resolver } from 'tn-graphql';
            @Resolver()
            export class UserResolve {
                @Query()
                index(): string {
                    return 'nguyen';
                }
            }
            `);
    await fs.add('start/route.ts', `
            import { Route } from '../../../../src/Support/Facades';
            
            Route.query('name', 'UserResolve.index').namespace('App');
            
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
}

export async function initProject2(fs: Filesystem) {
    await fs.add('config/app.ts', `
    import { RouterServiceProvider } from '../RouterServiceProvider';
                export default {
                    name: 'test',
                    providers: [
                    RouterServiceProvider
                    ]
                }
            `);
    await fs.add('.env', ``);
    await fs.add('app/UserResolve.ts', `
        import { Query, Resolver } from 'tn-graphql';
            @Resolver()
            export class UserResolve {
                @Query()
                index(): string {
                    return 'nguyen';
                }
            }
            `);
    await fs.add('start/route.ts', `
            import { Route } from '../../../../src/Support/Facades';
            
            Route.query('name', 'UserResolve.index');
            
            export = Route;
        `);
    await fs.add('RouterServiceProvider.ts', `
           import { RoutingServiceProvider } from '../../../src/Foundation/Routing/RoutingServiceProvider';
           import { Route } from '../../../src/Support/Facades';
export class RouterServiceProvider extends RoutingServiceProvider {
    _namespace = 'App';
    
    map() {
        Route.group(() => require(this.app.basePath('start/route'))).namespace('App');
    }
}
        
        `);
}

export async function initProjectApplyMiddleware(fs: Filesystem) {
    await fs.add('config/app.ts', `
    import { RouterServiceProvider } from '../RouterServiceProvider';
                export default {
                    name: 'test',
                    providers: [
                    RouterServiceProvider
                    ]
                }
            `);
    await fs.add('app/Acl.ts', `
    import { ResolverData } from 'tn-graphql';

export class Acl {
    public async handle (
        data: ResolverData,
        next,
        allowedRoles: string[],
    ) {
    throw new Error('test middleware');
        await next()
    }
}`);
    await fs.add('app/Kernel.ts', `
import { Service } from '../../../../src';
import { GraphQLKernel } from '../../../../src/Foundation/GraphQL';
import { Acl } from './Acl';

@Service()
export class Kernel extends GraphQLKernel {
    /**
     * global middleware
     */
    protected middleware = [
    ];

    /**
     * Register name middleware
     */
    protected routeMiddleware = {
        acl: Acl
    }
}`);
    await fs.add('.env', ``);
    await fs.add('app/UserResolve.ts', `
        import { Query, Resolver } from 'tn-graphql';
            @Resolver()
            export class UserResolve {
                @Query()
                index(): string {
                    return 'nguyen';
                }
            }
            `);
    await fs.add('start/route.ts', `
            import { Route } from '../../../../src/Support/Facades';
            
            Route.query('name', 'UserResolve.index').middleware('acl:admin');
            
            export = Route;
        `);
    await fs.add('RouterServiceProvider.ts', `
           import { RoutingServiceProvider } from '../../../src/Foundation/Routing/RoutingServiceProvider';
           import { Route } from '../../../src/Support/Facades';
export class RouterServiceProvider extends RoutingServiceProvider {
    _namespace = 'App';
    
    map() {
        Route.group(() => require(this.app.basePath('start/route'))).namespace('App');
    }
}
        
        `);
}

