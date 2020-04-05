/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/9/2020
 * Time: 10:24 PM
 */
import { Application } from '../../src/Foundation/Application';
import { Filesystem } from '@poppinss/dev-utils/build';
import { GraphQLKernel } from '../../src/Foundation/GraphQL';
import * as path from "path";
import { Database } from '@adonisjs/lucid/build/src/Database';
import { BaseModel } from '@adonisjs/lucid/build/src/Orm/BaseModel';
import { column } from '@adonisjs/lucid/build/src/Orm/Decorators';
import { Adapter } from '@adonisjs/lucid/build/src/Orm/Adapter';
import { DatabaseServiceProvider } from '../../src/Database/DatabaseServiceProvider';
const EventEmitter = require('events');
const Emittery = require('emittery');
const fs = new Filesystem(path.join(__dirname, './app'))

const app = new Application(__dirname);

async function main() {
    // app.bind('string', T);
    app.autoload(path.join(app.getBasePath(), 'app'), 'App');
    const kernel: GraphQLKernel = await app.make<GraphQLKernel>(GraphQLKernel);

    await kernel.handle();

    await app.register(new DatabaseServiceProvider(app));

    const db = app.db;

    BaseModel.$adapter = new Adapter(db);
    BaseModel.$container = app;

    class UserModel extends BaseModel {
        static table = 'users';

        @column({ isPrimary: true })
        id: string;

        @column()
        name: string;


        static boot() {
            super.boot();
            this.hooks.add('before', 'save', (model) => {

                model.name = 'nguyen';
                console.log('hook save');
                return model;
            });
            // this.after('save', (model) => {
            //
            //     console.log('save', model);
            // });
        }
    }

    const user = await new UserModel();
    user.name = 'gsdgsd';
    await user.save();

    // console.log(user);

    // console.log((await UserModel.query().first()).save());

    process.exit();
}

main();

