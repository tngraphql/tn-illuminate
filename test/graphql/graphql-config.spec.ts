/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/20/2020
 * Time: 5:53 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Application, GraphQLKernel } from '../../src/Foundation';
import { ValidatorServiceProvider } from '../../src/Foundation/Validate/ValidatorServiceProvider';
import { Args, Query, Resolver } from 'tn-graphql';
import { getIntrospectionQuery, graphql, IntrospectionObjectType, IntrospectionSchema, TypeKind } from 'graphql';

describe('GraphQL Kernel Config', () => {
    it('nullableByDefault', async () => {
        const app = new Application();
        new ValidatorServiceProvider(app).register()

        @Resolver()
        class SampleResolver {
            @Query()
            normalQuery(): boolean {
                return true;
            }
        }

        app.bind('SampleResolver',() => SampleResolver);

        class Kernel extends GraphQLKernel {
            // protected nullableByDefault = true;
        }

        const kernel: Kernel = await app.make<Kernel>(Kernel);

        app.route.query('normalQuery', 'SampleResolver.normalQuery');

        const schema = await kernel.complie();


        const query = `query {
            normalQuery
          }`;

        const result = await graphql(schema, getIntrospectionQuery());

        const schemaIntrospection = result.data!.__schema as IntrospectionSchema;

        const queryType = schemaIntrospection.types.find(
            type => type.name === schemaIntrospection.queryType.name,
        ) as IntrospectionObjectType;

        expect(queryType.fields[0].type.kind).toBe(TypeKind.NON_NULL)
    });


});