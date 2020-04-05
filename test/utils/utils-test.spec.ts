/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/5/2020
 * Time: 11:26 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ensureIsFunction, isClass, isFuntion, isObject, namespaceToString } from '../../src/utils';

describe('unit-test', () => {
    it('return namespace to string', async () => {
        const fn = function() {

        };

        function fn1() {

        }

        class A {}

        expect(namespaceToString('')).toBe('');
        expect(namespaceToString(Symbol.for('key'))).toBe('Symbol(key)');
        expect(namespaceToString(null)).toBe('null');
        expect(namespaceToString(undefined)).toBe('undefined');
        expect(namespaceToString({} as any)).toBe('object Object');
        expect(namespaceToString(function() {})).toBe('Closure');
        expect(namespaceToString(() => {})).toBe('Closure');
        expect(namespaceToString(async () => {})).toBe('Closure');
        expect(namespaceToString(fn)).toBe('Closure fn');
        expect(namespaceToString(fn1)).toBe('Closure fn1');
        expect(namespaceToString(A)).toBe('Closure A');
        expect(namespaceToString(0 as any)).toBe('0');
        expect(namespaceToString(1 as any)).toBe('1');
        expect(namespaceToString('   ')).toBe('');
        expect(namespaceToString('   1')).toBe('1');
    });

    it('return is true if given value is function', async () => {
        const fn = function() {

        };

        function fn1() {

        }

        class A {}

        expect(isFuntion(fn)).toBeTruthy();
        expect(isFuntion(fn1)).toBeTruthy();
        expect(isFuntion(A)).toBeTruthy();
    });

    it('return is true if given value is class', async () => {
        expect(isClass(class A{})).toBeTruthy();
        expect(isClass(() => {})).toBeFalsy();
        expect(isClass(function A(){})).toBeFalsy();
        expect(isClass('class A{}')).toBeFalsy();
    });

    it('throw exception if given value is not function', async () => {
        expect(() => ensureIsFunction('1232' as any, '1232')).toThrow();
    });

    it('return is true if given value is object and is not array or null', async () => {
        expect(isObject({})).toBeTruthy();
        expect(isObject(()=>{})).toBeFalsy();
        expect(isObject(null)).toBeFalsy();
        expect(isObject([null])).toBeFalsy();
    });
})
