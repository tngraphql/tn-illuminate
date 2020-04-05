/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/5/2020
 * Time: 1:09 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Application } from '../../src/Foundation';
import { cleanup, getDb, setup } from './helpers';
import { DatabasePresenceVerifier } from '../../src/Foundation/Validate/DatabasePresenceVerifier';
import { Rule } from '../../src/Foundation/Validate/Rule';

describe('database-presence-verifier', () => {
    let db;
    let app;
    let verifier;

    beforeEach(async () => {
        await setup();
        db = getDb();
        app = new Application();
        verifier = new DatabasePresenceVerifier(db);
    });

    afterEach(async () => {
        await cleanup();
    });

    it('simple get count users using id 1', async () => {
        const count = await verifier.getCount('users', 'id', '1');
        expect(count.total).toBe(1);
    });

    it('simple get count users using array value', async () => {
        const count = await verifier.getCount('users', 'id', ['1','2']);
        expect(count.total).toBe(1);
    });

    it('get count users using ignore column', async () => {
        const count = await verifier.getCount('users', 'id', '1', '1', 'id');
        expect(count.total).toBe(0);
    });

    it('get count users using extra where', async () => {
        {
            const count = await verifier.getCount('users', 'id', '1', null, null, [
                [
                    'id',
                    '1'
                ]
            ]);
            expect(count.total).toBe(1);
        }
        {
            const count = await verifier.getCount('users', 'id', '1', null, null, [
                [
                    'id',
                    '2'
                ]
            ]);
            expect(count.total).toBe(0);
        }

        {
            const rule = Rule.unique('model', 'id').where('name');
            const count = await verifier.getCount('users', 'id', '1', null, null, rule.unique.where);
            expect(count.total).toBe(0);
        }

        {
            const rule = Rule.unique('model', 'id').where('name', 'nguyen');
            const count = await verifier.getCount('users', 'id', '1', null, null, rule.unique.where);
            expect(count.total).toBe(1);
        }
    });

    it('where using callback', async () => {
        {
            const rule = Rule.unique('model', 'id').where(query => {
                query.where('name', 'nguyen');
            });
            const count = await verifier.getCount('users', 'id', '1', null, null, rule.unique.where);
            expect(count.total).toBe(1);
        }
        {
            const rule = Rule.unique('model', 'id').where(query => {
                query.where('name', 'foo');
            });
            const count = await verifier.getCount('users', 'id', '1', null, null, rule.unique.where);
            expect(count.total).toBe(0);
        }
    });

    it('where using callback', async () => {
        {
            const rule = Rule.unique('model', 'id').where(query => {
                query.where('name', 'nguyen');
            });
            const count = await verifier.getCount('users', 'id', '1', null, null, rule.unique.where);
            expect(count.total).toBe(1);
        }
        {
            const rule = Rule.unique('model', 'id').where(query => {
                query.where('name', 'foo');
            });
            const count = await verifier.getCount('users', 'id', '1', null, null, rule.unique.where);
            expect(count.total).toBe(0);
        }
    });

    it('where value is array', async () => {
        const count = await verifier.getCount('users', 'id', '1', null, null, [
            ['name', ['=','nguyen']]
        ]);
        expect(count.total).toBe(1);
    });

    it('where not null', async () => {
        const rule = Rule.unique('model', 'id').whereNotNull('id');
        const count = await verifier.getCount('users', 'id', '1', null, null, rule.unique.where);
        expect(count.total).toBe(1);
    });

    it('where not', async () => {
        const rule = Rule.unique('model', 'id').where('id', '!1');
        const count = await verifier.getCount('users', 'id', '1', null, null, rule.unique.where);
        expect(count.total).toBe(0);
    });

    it('set connection', async () => {
        verifier.setConnection('nodb');
        expect(verifier.__connection).toBe('nodb');
        expect(() => verifier.table('users')).toThrow();
        verifier.setConnection(undefined);
    });
})
