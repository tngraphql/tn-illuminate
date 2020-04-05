import { Filesystem } from '@poppinss/dev-utils/build';
import { join } from 'path';
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

let fs = new Filesystem(join(__dirname, './validate_in'));

describe('Rule', () => {
    describe('Rule | In', () => {
        it('render rule in | value number', async () => {
            expect(Rule.in(1)).toBe('in:1')
        });
        it('render rule in | value array number', async () => {
            expect(Rule.in([1])).toBe('in:1')
        });

        it('render rule in | value string', async () => {
            expect(Rule.in('1')).toBe('in:1')
        });
        it('render rule in | value array', async () => {
            expect(Rule.in(['1'])).toBe('in:1')
        });
        it('render rule in | many value', async () => {
            expect(Rule.in(['1', '2'])).toBe('in:1,2')
        });
    });

    describe('Rule | Not In', () => {
        it('render rule not in | value number', async () => {
            expect(Rule.notIn(1)).toBe('not_in:1')
        });
        it('render rule not in | value array number', async () => {
            expect(Rule.notIn([1])).toBe('not_in:1')
        });

        it('render rule not in | value string', async () => {
            expect(Rule.notIn('1')).toBe('not_in:1')
        });
        it('render rule not in | value array', async () => {
            expect(Rule.notIn(['1'])).toBe('not_in:1')
        });
        it('render rule not in | many value', async () => {
            expect(Rule.notIn(['1', '2'])).toBe('not_in:1,2')
        });
    });

    describe('Rule | Exists', () => {
        it('Where', async () => {
            expect(Rule.exists('users', 'id').where('name', 'foo')).toEqual({
                exists: { model: 'users', column: 'id', where: [['name', 'foo']] }
            });
            expect(Rule.exists('users', 'id').where('name', undefined)).toEqual({
                exists: { model: 'users', column: 'id', where: [['name', 'null']] }
            });
            const fn = (query) => {};
            expect(Rule.exists('users', 'id').where(fn, undefined)).toEqual({
                exists: { model: 'users', column: 'id', where: [fn] }
            });
            expect(Rule.exists('users', 'id').where(fn, 'foo')).toEqual({
                exists: { model: 'users', column: 'id', where: [fn] }
            });

            // @ts-ignore
            expect(Rule.exists('users', 'id').where('name', '1', '2', '3')).toEqual({
                exists: { model: 'users', column: 'id', where: [['name', '1']] }
            })

            expect(() => Rule.exists('users', 'id').where({ 'name': null }, undefined)).toThrow(TypeError);
            expect(() => Rule.exists('users', 'id').where([], undefined)).toThrow(TypeError);
            expect(() => Rule.exists('users', 'id').where(null, undefined)).toThrow(TypeError);
            expect(() => Rule.exists('users', 'id').where(undefined, undefined)).toThrow(TypeError);
        });

        it('where not', async () => {
            expect(Rule.exists('users', 'id').whereNot('name', 'foo')).toEqual({
                exists: { model: 'users', column: 'id', where: [['name', '!foo']] }
            });
            expect(() => Rule.exists('users', 'id').whereNot(((query) => {}) as any, undefined)).toThrow(TypeError);
            expect(() => Rule.exists('users', 'id').whereNot('name', undefined)).toThrow(TypeError);
        });

        it('where null', async () => {
            expect(Rule.exists('users', 'id').whereNull('name')).toEqual({
                exists: { model: 'users', column: 'id', where: [['name', 'null']] }
            });
            expect(() => Rule.exists('users', 'id').whereNull(((query) => {}) as any)).toThrow(TypeError);
        });

        it('where not null', async () => {
            expect(Rule.exists('users', 'id').whereNotNull('name')).toEqual({
                exists: { model: 'users', column: 'id', where: [['name', 'NOT_NULL']] }
            });
            expect(() => Rule.exists('users', 'id').whereNotNull(((query) => {}) as any)).toThrow(TypeError);
        });

        it('where in and not in', async () => {
            Rule.exists('users', 'id').whereIn('name', 1);
            Rule.exists('users', 'id').whereNotIn('name', 1);
            expect(() => Rule.exists('users', 'id').whereIn(((query) => {}) as any, 1)).toThrow(TypeError);
            expect(() => Rule.exists('users', 'id').whereNotIn(((query) => {}) as any, 1)).toThrow(TypeError);
        });

        it('using', async () => {
            Rule.exists('users', 'id').using(query => {
                query.where('name', 'foo');
            });
        });
    });

    describe('Rule Unique', () => {
        it('Where', async () => {
            expect(Rule.unique('users', 'id').where('name', 'foo')).toEqual({
                unique: { model: 'users', column: 'id', where: [['name', 'foo']], "ignore": { "id": null, "idColumn": "id" } }
            });
            expect(Rule.unique('users', 'id').where('name', undefined)).toEqual({
                unique: { model: 'users', column: 'id', where: [['name', 'null']], "ignore": { "id": null, "idColumn": "id" } }
            });
            const fn = (query) => {};
            expect(Rule.unique('users', 'id').where(fn, undefined)).toEqual({
                unique: { model: 'users', column: 'id', where: [fn], "ignore": { "id": null, "idColumn": "id" } }
            });
            expect(Rule.unique('users', 'id').where(fn, 'foo')).toEqual({
                unique: { model: 'users', column: 'id', where: [fn], "ignore": { "id": null, "idColumn": "id" } }
            });
            // @ts-ignore
            expect(Rule.unique('users', 'id').where('name', '1', '2', '3')).toEqual({
                unique: { model: 'users', column: 'id', "ignore": {
                        "id": null,
                        "idColumn": "id"
                    },where: [['name', '1']] }
            })

            expect(() => Rule.unique('users', 'id').where({ 'name': null }, undefined)).toThrow(TypeError);
            expect(() => Rule.unique('users', 'id').where([], undefined)).toThrow(TypeError);
            expect(() => Rule.unique('users', 'id').where(null, undefined)).toThrow(TypeError);
            expect(() => Rule.unique('users', 'id').where(undefined, undefined)).toThrow(TypeError);
        });

        it('where not', async () => {
            expect(Rule.unique('users', 'id').whereNot('name', 'foo')).toEqual({
                unique: { model: 'users', column: 'id', where: [['name', '!foo']], "ignore": { "id": null, "idColumn": "id" } }
            });
            expect(() => Rule.unique('users', 'id').whereNot(((query) => {}) as any, undefined)).toThrow(TypeError);
            expect(() => Rule.unique('users', 'id').whereNot('name', undefined)).toThrow(TypeError);
        });

        it('where null', async () => {
            expect(Rule.unique('users', 'id').whereNull('name')).toEqual({
                unique: { model: 'users', column: 'id', where: [['name', 'null']], "ignore": { "id": null, "idColumn": "id" } }
            });
            expect(() => Rule.unique('users', 'id').whereNull(((query) => {}) as any)).toThrow(TypeError);
        });

        it('where not null', async () => {
            expect(Rule.unique('users', 'id').whereNotNull('name')).toEqual({
                unique: { model: 'users', column: 'id', where: [['name', 'NOT_NULL']], "ignore": { "id": null, "idColumn": "id" } }
            });
            expect(() => Rule.unique('users', 'id').whereNotNull(((query) => {}) as any)).toThrow(TypeError);
        });

        it('where in and not in', async () => {
            Rule.unique('users', 'id').whereIn('name', 1);
            Rule.unique('users', 'id').whereNotIn('name', 1);
            expect(() => Rule.unique('users', 'id').whereIn(((query) => {}) as any, 1)).toThrow(TypeError);
            expect(() => Rule.unique('users', 'id').whereNotIn(((query) => {}) as any, 1)).toThrow(TypeError);
        });

        it('using', async () => {
            Rule.unique('users', 'id').using(query => {
                query.where('name', 'foo');
            });
        });
    });
});
