/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/9/2020
 * Time: 10:24 PM
 */
// import { TestService } from './TestService';
// import { join } from "path";
// import { Filesystem } from '@poppinss/dev-utils';
import { Application } from '../../src/Foundation/Application';
// import { Container } from '../../src/Container/Container';
import { ConsoleKernel } from '../../src/Foundation/Console/ConsoleKernel';
import { BaseCommand, Generator } from '@tngraphql/console';
import { AceApplication } from '../../src/Foundation/Console';
// import { AppNameCommand } from '../../src/Foundation/Console/AppNameCommand';
import { AceServiceProvider } from '../../src/Foundation/Providers/AceServiceProvider';
import { GeneratorFile } from '@tngraphql/console/dist/Generator/File';
import { join } from "path";
import { Filesystem } from '@poppinss/dev-utils/build';
const fs = new Filesystem(join(__dirname, './app'))
// import { Kernel } from '../../src/Foundation/Kernel';
import { Logger } from '@poppinss/fancy-logs'
import { Env } from '../../src/Support/Env';
import { GraphQLKernel } from '../../src/Foundation/GraphQL';
import { Emitter } from '@adonisjs/events/build/standalone'
import { EmitterContract } from '../../src/Contracts/Events/EmitterContract';
import { event } from '../../src/Support/helpers';
import { Event } from '../../src/Support/Facades';
import { ApolloServer } from 'apollo-server';
import * as path from "path";
const EventEmitter = require('events');
const Emittery = require('emittery');

const app = new Application(__dirname);

async function main() {
    // app.bind('string', T);
    app.autoload(path.join(app.getBasePath(), 'app'), 'App');
    const kernel:GraphQLKernel = await app.make<GraphQLKernel>(GraphQLKernel);

    await kernel.handle();

    class User{
        getUser() {
            return 'nguyen';
        }
    }

    app.singleton('tested', function() {
        return {};
    });

    app.fake('tested', function() {
        return {
            getUser() {
                return 'fake';
            }
        }
    });

    app.useProxies();
    const user = app.use<User>('tested');
    class A{}
    const key: any = {};
    // app.bind('11254125' as any, () => 'nguyen');
    // app[key] = 'nguyen';
    console.log(app.use(key));

}

main();

