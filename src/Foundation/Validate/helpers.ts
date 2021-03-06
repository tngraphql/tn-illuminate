/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/18/2020
 * Time: 1:16 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import _ = require('lodash');
import { isClass } from '@tngraphql/graphql/dist/helpers/utils';
import { RuleValue } from '../../Decorators/Rules';

export const META_DATA_VALIDATE_KEY = 'design:validatejs';

function customizer(objValue, srcValue) {
    if ( _.isArray(objValue) ) {
        return _.uniq(objValue.concat(srcValue));
    }
    if ( _.isObject(objValue) ) {
        return { ...objValue, ...srcValue };
    }

    return srcValue;
}

export function merge(...args) {
    return (_ as any).mergeWith(...args, customizer);
}

export function isClassRule(data: any) {
    if ( isClass(data) ) {
        return true;
    }

    if ( Array.isArray(data) && data.length === 1 ) {
        return isClass(data[0]);
    }

    return false;
}

export function compileRules(object, key = '') {
    let res = {};

    for( let index in object ) {
        if ( object[index] instanceof RuleValue) {
            res[`${ key }${ index }`] = object[index].data;
        } else if ( Array.isArray(object[index]) ) {
            (object[index] as any[]).forEach(((value, index1) => {
                res = merge(compileRules(value, `${ key }${ index }.*.`), res);
            }));
        } else {
            res = merge(compileRules(object[index], `${ key }${ index }.`), res);
        }
    }
    return res;
}

export function compileMessages(object, key = '', ctx: any = {}, args: any = {}) {
    let res = {};

    for( let index in object ) {
        if ( object[index] instanceof RuleValue) {
            res = merge(mapMessage(`${ key }${ index }`, fnMessage(object[index].messages, ctx, args)), res);
        } else if ( Array.isArray(object[index]) ) {
            (object[index] as any[]).forEach(((value, index1) => {
                res = merge(compileMessages(value, `${ key }${ index }.*.`, ctx, args), res);
            }));
        } else {
            res = merge(compileMessages(object[index], `${ key }${ index }.`, ctx, args), res);
        }
    }
    return res;
}

export function fnMessage(message, context, args) {
    if (typeof message === "function") {
        return message(context, args)
    }
    return message;
}

function mapMessage(key, values: {[key: string]: string}) {
    const res = {};
    for( let i in values ) {
        res[`${ i }.${ key }`] = values[i];
    }
    return res;
}

export async function handlerRulers(target, args, context = {}) {
    if ( target instanceof RuleValue) {
        return target;
    }
    if ( isClass(target) ) {
        return handlerRulers(target.prototype, args, context);
    }

    const res = Reflect.getMetadata(META_DATA_VALIDATE_KEY, target) || target;
    const data = Object.assign({}, res);

    for( let item of Object.keys(data) ) {
        if ( typeof data[item].data === 'function' && ! isClass(data[item].data) ) {
            let messages = data[item].messages;
            data[item] = await data[item].data(args, context);
            if ( ! isClassRule(data[item])) {
                data[item] = new RuleValue(data[item], messages);
            }
        }

        if ( ! isClassRule(data[item]) && !(data[item] instanceof RuleValue)) {
            data[item] = new RuleValue(data[item]);
        }

        if ( isClass(data[item]) ) {
            data[item] = await handlerRulers(data[item], args, context);
        }

        if ( Array.isArray(data[item]) ) {
            data[item] = await Promise.all((data[item] as any[]).map((r, index) => {
                if ( isClass(r) ) {
                    if ( args && args[item] ) {
                        return handlerRulers(r, args[item][index], context);
                    } else {
                        return handlerRulers(r, undefined, context);
                    }
                }
                return r;
            }));
        }
    }

    return data;
}
