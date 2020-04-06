/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/10/2020
 * Time: 10:08 AM
 */
import { Exception } from '@poppinss/utils';
import { NameSapceType } from '../Container/Container';

const toString = Function.prototype.toString

/**
 * Raises error with a message when callback is not
 * a function.
 */
export function ensureIsFunction (callback: Function, message: string) {
    if ( ! isFuntion(callback) ) {
        throw new Exception(message, 500, 'E_RUNTIME_EXCEPTION');
    }
}

/**
 * Returns a function telling if value is a class or not
 */
export function isClass (fn: any): boolean {
    return isFuntion(fn) && /^class\s/.test(toString.call(fn))
}

/**
 * Returns a boolean to differentiate between null and objects
 * and arrays too
 */
export function isObject (value: any): boolean {
    return value && typeof (value) === 'object' && !Array.isArray(value)
}

/**
 * Returns a function telling if value is a class or not
 */
export function isFuntion (value: any): boolean {
    return typeof value === 'function';
}

/**
 * Returns a boolean telling if value is an esm module
 * with `export default`.
 */
export function isEsm (value: any): boolean {
    return value && value.__esModule
}

/**
 * Returns a boolean telling if value is a primitive or object constructor.
 */
export function isPrimtiveConstructor (value: any): boolean {
    return [String, Function, Object, Date, Number, Boolean].indexOf(value) > -1
}

/**
 * Return a string of namespace type
 *
 * @param namespace
 */
export function namespaceToString(namespace: NameSapceType) {
    if ( ! namespace ) {
        return String(namespace).trim();
    }

    if ( typeof namespace === 'function') {
        if ( namespace.name ) {
            return `Closure ${namespace.name}`;
        }
        return `Closure`;
    }

    if ( typeof namespace === 'object' ) {
        return `object ${ (namespace as any).constructor.name }`;
    }

    return String(namespace).trim();
}
