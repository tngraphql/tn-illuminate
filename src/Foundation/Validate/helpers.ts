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

export function compileMessages(object, key = '') {
    let res = {};

    for( let index in object ) {
        if ( object[index] instanceof RuleValue) {
            res = merge(mapMessage(`${ key }${ index }`, object[index].messages), res);
        } else if ( Array.isArray(object[index]) ) {
            (object[index] as any[]).forEach(((value, index1) => {
                res = merge(compileMessages(value, `${ key }${ index }.*.`), res);
            }));
        } else {
            res = merge(compileMessages(object[index], `${ key }${ index }.`), res);
        }
    }
    return res;
}

function mapMessage(key, values: {[key: string]: string}) {
    const res = {};
    for( let i in values ) {
        res[`${ i }.${ key }`] = values[i];
    }
    return res;
}

export function handlerRulers(target, args) {
    if ( target instanceof RuleValue) {
        return target;
    }
    if ( isClass(target) ) {
        return handlerRulers(target.prototype, args);
    }

    const res = Reflect.getMetadata(META_DATA_VALIDATE_KEY, target) || target;
    const data = Object.assign({}, res);

    for( let item of Object.keys(data) ) {
        if ( typeof data[item].data === 'function' && ! isClass(data[item].data) ) {
            let messages = data[item].messages;
            data[item] = data[item].data(args);
            if ( ! isClassRule(data[item])) {
                data[item] = new RuleValue(data[item], messages);
            }
        }

        if ( ! isClassRule(data[item]) && !(data[item] instanceof RuleValue)) {
            data[item] = new RuleValue(data[item]);
        }

        if ( isClass(data[item]) ) {
            data[item] = handlerRulers(data[item], args);
        }

        if ( Array.isArray(data[item]) ) {
            data[item] = (data[item] as any[]).map((r, index) => {
                if ( isClass(r) ) {
                    if ( args && args[item] ) {
                        return handlerRulers(r, args[item][index]);
                    } else {
                        return handlerRulers(r, undefined);
                    }
                }
                return r;
            });
        }
    }

    return data;
}
