/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/5/2020
 * Time: 10:46 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */


export function CreateProxyReference(reference: any, app: any) {
    const initTarget = (target) => {
        if ( ! target.__ref ) {
            target.__ref = app.make(reference());
        }
    }

    return new Proxy({}, {
        getPrototypeOf: function() {
            return reference().prototype;
        },
        setPrototypeOf(target: any, p) {
            initTarget(target);
            return Reflect.setPrototypeOf(target.__ref, p);
        },
        defineProperty(target: any, p, attributes) {
            initTarget(target);
            return Reflect.defineProperty(target.__ref, p, attributes);
        },
        has(target: any, p: string | number | symbol): boolean {
            initTarget(target);
            return Reflect.has(target.__ref, p);
        },
        set(target: any, p: string | number | symbol, value: any, receiver: any): boolean {
            initTarget(target);
            return Reflect.set(target.__ref, p, value, receiver);
        },
        apply(target: any, thisArg: any, argArray?: any): any {
            initTarget(target);
            return Reflect.apply(target.__ref, thisArg, argArray);
        },
        deleteProperty(target: any, p: string | number | symbol): boolean {
            initTarget(target);
            return Reflect.deleteProperty(target.__ref, p);
        },
        preventExtensions(target: any): boolean {
            initTarget(target);
            return Reflect.preventExtensions(target.__ref);
        },
        enumerate(target: any): PropertyKey[] {
            initTarget(target);
            return Reflect.enumerate(target.__ref) as any;
        },
        ownKeys(target: any): PropertyKey[] {
            initTarget(target);
            return Reflect.ownKeys(target.__ref);
        },
        getOwnPropertyDescriptor(target: any, p: string | number | symbol): PropertyDescriptor | undefined {
            initTarget(target);
            return Reflect.getOwnPropertyDescriptor(target.__ref, p);
        },
        isExtensible(target: any): boolean {
            initTarget(target);
            return Reflect.isExtensible(target.__ref);
        },
        get: (obj: any, prop: string, receiver) => {
            initTarget(obj);
            return Reflect.get(obj.__ref, prop, receiver);
        }
    });
}
