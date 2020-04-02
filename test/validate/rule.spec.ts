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
});
