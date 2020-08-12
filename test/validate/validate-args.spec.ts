/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/17/2020
 * Time: 10:01 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import 'reflect-metadata';
import { DefaultContainer } from '@tngraphql/graphql/dist/utils/container';
import { Router } from '@tngraphql/graphql/dist/router';
import { graphql, GraphQLSchema } from 'graphql';
import { getMetadataStorage } from '@tngraphql/graphql/dist/metadata/getMetadataStorage';
import { Arg, Args, ArgsType, buildSchema, Field, ObjectType, Query, Resolver } from '@tngraphql/graphql';
import _ = require('lodash');
import { Rules } from '../../src/Decorators/Rules';
import { Filesystem } from '@poppinss/dev-utils/build';
import { join } from "path";
import { Application, LoadConfiguration } from '../../src/Foundation';
import { ValidatorServiceProvider } from '../../src/Foundation/Validate/ValidatorServiceProvider';
import { RegisterFacades } from '../../src/Foundation/Bootstrap/RegisterFacades';
import { ValidateArgs } from '../../src/Decorators/ValidateArgs';

let fs = new Filesystem(join(__dirname, './app'))

describe('Validate', () => {
    let schema: GraphQLSchema;
    let sampleResolver: any;
    let middlewareLogs: string[] = [];
    const router = new Router();
    const container = new DefaultContainer();
    const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

    beforeAll(async () => {
        getMetadataStorage().clear();

        const app = new Application();
        new ValidatorServiceProvider(app).register()
        new RegisterFacades().bootstrap(app);
        new LoadConfiguration().bootstrap(app);
        app.config.set('i18n.defaultLocale', 'vi');

        @ObjectType()
        class SampleObject {
            @Field()
            normalField: string;
        }

        @ArgsType()
        class NormalArgs {
            @Field()
            @Rules('in:foo')
            name: string;
        }

        @ArgsType()
        class CustomMessageArgs {
            @Field()
            @Rules('in:foo', {
                in: 'custom message validate :attribute'
            })
            name: string;
        }

        @Resolver(of => SampleObject)
        class SampleResolver {
            @Query()
            @ValidateArgs(NormalArgs)
            normalQuery(@Args() args: NormalArgs): boolean {
                return true;
            }

            @Query()
            @ValidateArgs({
                name: 'in:foo',
            }, ctx => ({
                'in.name': 'custom message validate :attribute'
            }))
            validateCustomMessageQuery(@Arg('name') name: string): boolean {
                return true;
            }

            @Query()
            @ValidateArgs(CustomMessageArgs)
            validateCustomMessageArgsQuery(@Args() args: CustomMessageArgs): boolean {
                return true
            }

            @Query()
            @ValidateArgs(CustomMessageArgs, {
                'in.name': 'custom message validate args :attribute'
            })
            validateCustomMessagesArgsQuery(@Args() args: CustomMessageArgs) : boolean {
                return true;
            }
        }


        container.bind('SampleResolver', SampleResolver);
        router.query('normalQuery', 'SampleResolver.normalQuery');
        router.query('validateCustomMessageQuery', 'SampleResolver.validateCustomMessageQuery');
        router.query('validateCustomMessageArgsQuery', 'SampleResolver.validateCustomMessageArgsQuery');
        router.query('validateCustomMessagesArgsQuery', 'SampleResolver.validateCustomMessagesArgsQuery');

        schema = await buildSchema({
            router,
            container,
            nullableByDefault: false
        });
    })

    it('throws error on validate fall', async () => {
        const query = `query {
      normalQuery(name: "nguyen")
    }`;

        const res = await graphql(schema, query);
        expect(res.errors).not.toBeNull();
        expect(res.errors[0].message).toBe('validation');
    });

    it('pass validate', async () => {
        const query = `query {
      normalQuery(name: "foo")
    }`;

        const {data} = await graphql(schema, query);
        expect(data.normalQuery).toBe(true);
    });

    it('should be allowed show custom messages', async () => {
        const query = `query {
      validateCustomMessageQuery(name: "nguyen")
    }`;

        const res = await graphql(schema, query);
        expect(res.errors).not.toBeNull();
        expect(res.errors[0].message).toBe('validation');
        expect(_.get((res.errors[0].originalError as any).getValidatorMessages(), 'name.0')).toEqual('custom message validate name')
    });

    it('should be allowed show custom messages for input attribute', async () => {
        const query = `query {
      validateCustomMessageArgsQuery(name: "nguyen")
    }`;

        const res = await graphql(schema, query);
        expect(res.errors).not.toBeNull();
        expect(res.errors[0].message).toBe('validation');
        expect(_.get((res.errors[0].originalError as any).getValidatorMessages(), 'name.0')).toEqual('custom message validate name')
    });

    it('should be allowed show custom messages for args', async () => {
        const query = `query {
      validateCustomMessagesArgsQuery(name: "nguyen")
    }`;

        const res = await graphql(schema, query);
        expect(res.errors).not.toBeNull();
        expect(res.errors[0].message).toBe('validation');
        expect(_.get((res.errors[0].originalError as any).getValidatorMessages(), 'name.0')).toEqual('custom message validate args name')
    });
});
