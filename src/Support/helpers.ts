import { Event } from './Facades';
import _ = require('lodash');

/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/15/2020
 * Time: 4:17 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */


export async function event(data, EE?) {
    if ( ! EE ) {
        EE = Event;
    }
    return EE.emit(data.constructor, data);
}

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
    // @ts-ignore
    return _.mergeWith(...args, customizer);
}
