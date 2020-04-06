/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/5/2020
 * Time: 10:50 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Application } from '../src/Foundation';
import { CreateProxyReference } from '../src/Container/ProxyReference';

describe('create-proxy-reference', () => {
    it('should work properly', async () => {
        const app = new Application();
        class A {

        }

        const ref2 = CreateProxyReference(() => A, app);
        const desc = { configurable: true, enumerable: true, value: 10 };
        Object.defineProperty(ref2, 'a', desc)
        Object.setPrototypeOf(ref2, {
            name: 'foo'
        });
        ref2.test = 'foo';

        expect(ref2).toBeInstanceOf(A);
        expect(ref2.a).toBe(10);
        expect(ref2.name).toBe('foo');
        expect(ref2.test).toBe('foo');

        delete ref2.test;
        expect(ref2.test).toBeUndefined();
    });

    it('getOwnPropertyDescriptor should work properly', async () => {
        const app = new Application();
        class A {

        }

        const ref2 = CreateProxyReference(() => A, app);

        ref2.foo = 'foo';
        const descriptor1 = Object.getOwnPropertyDescriptor(ref2, 'foo');
        expect(descriptor1.configurable).toBeTruthy();
        expect(descriptor1.value).toBe('foo');
    });
})
