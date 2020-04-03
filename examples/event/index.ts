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
    const kernel = await app.make<GraphQLKernel>(GraphQLKernel);

    // app.handle();
    // c.getAce().register([T]);
    AceApplication.starting(ace => {
        // ace.register([T]);
        // ace.register([AppNameCommand])
    })
    await kernel.handle();

    console.log(Env.get('name'));

    class OrderShipped {
        constructor(public data: any) {
        }
    }

    // Event.fake();

    Event.on(OrderShipped, data => {
        console.log(data);
    });

    Event.on(OrderShipped, data => {
        console.log(data);
    })

    // app.events
    event(new OrderShipped({ id: 1, email: 'foo@bar.com' }), app.events)
}

main();

