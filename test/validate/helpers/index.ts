/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/21/2020
 * Time: 9:36 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as knex from 'knex'
import * as dotenv from 'dotenv'
import { join } from 'path'
import { Filesystem } from '@poppinss/dev-utils'
import { Profiler } from '@adonisjs/profiler/build/standalone'
import { FakeLogger as Logger } from '@adonisjs/logger/build/standalone'
import { DatabaseContract } from '@ioc:Adonis/Lucid/Database';
import { Database } from 'tn-lucid/build/src/Database';

const TableBuilder = require('knex/lib/schema/tablebuilder')
const { toArray } = require('lodash')
TableBuilder.prototype.string = function() {
    const args = toArray(arguments)
    if ( ! args[1] ) {
        args[1] = 191
    }
    const builder = this.client.columnBuilder(this, 'string', args)
    this._statements.push({
        grouping: 'columns',
        builder,
    })
    return builder
}

export const fs = new Filesystem(join(__dirname, 'tmp'))
dotenv.config()

/**
 * Returns config based upon DB set in environment variables
 */
export function getConfig() {
    switch (process.env.DB) {
    case 'sqlite':
        return {
            client: 'sqlite',
            connection: {
                filename: join(fs.basePath, 'db.sqlite'),
            },
            useNullAsDefault: true,
            debug: false,
        }
    case 'mysql':
        return {
            client: 'mysql',
            connection: {
                host: process.env.MYSQL_HOST as string,
                port: Number(process.env.MYSQL_PORT),
                database: process.env.DB_NAME as string,
                user: process.env.MYSQL_USER as string,
                password: process.env.MYSQL_PASSWORD as string,
            },
            useNullAsDefault: true,
        }
    case 'pg':
        return {
            client: 'pg',
            connection: {
                host: process.env.PG_HOST as string,
                port: Number(process.env.PG_PORT),
                database: process.env.DB_NAME as string,
                user: process.env.PG_USER as string,
                password: process.env.PG_PASSWORD as string,
            },
            useNullAsDefault: true,
        }
    default:
        throw new Error(`Missing test config for ${ process.env.DB } connection`)
    }
}

/**
 * Does base setup by creating databases
 */
export async function setup() {
    if ( process.env.DB === 'sqlite' ) {
        await fs.ensureRoot()
    }

    const db = knex(getConfig())

    const hasUsersTable = await db.schema.hasTable('users')
    if ( ! hasUsersTable ) {
        await db.schema.createTable('users', (table) => {
            table.increments()
            table.string('name')
        })

        await db.table('users').insert({
            name: 'nguyen',
        });
    }
    await db.destroy()
}

/**
 * Does cleanup removes database
 */
export async function cleanup(customTables?: string[]) {
    const db = knex(getConfig())

    if ( customTables ) {
        await Promise.all(customTables.map((table) => db.schema.dropTableIfExists(table)))
        await db.destroy()
        return
    }

    await db.schema.dropTableIfExists('users')

    await db.destroy()
}

/**
 * Returns fake logger instance
 */
export function getLogger() {
    return new Logger({
        enabled: true,
        name: 'lucid',
        level: 'debug',
    })
}

/**
 * Returns profiler instance
 */
export function getProfiler(enabled: boolean = false) {
    return new Profiler(__dirname, getLogger(), { enabled })
}

/**
 * Returns the database instance
 */
export function getDb() {
    const config = {
        connection: 'primary',
        connections: {
            primary: getConfig(),
            secondary: getConfig(),
        },
    }

    return new Database(config as any, getLogger(), getProfiler()) as DatabaseContract
}
