/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/17/2020
 * Time: 9:19 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import {SymbolKeysNotSupportedError} from '@tngraphql/graphql';
import { isClassRule, META_DATA_VALIDATE_KEY } from '../Foundation/Validate/helpers';

export class RuleValue {
    constructor(public data: any, public messages?: any) {
        if ( data && typeof data === 'object' && ! Array.isArray(data) ) {
            this.data = [data];
        }
    }
}
type Message<T> = T | ((context?: any, args?: any) => T)

interface ClassArgs {
    new ()
}

type ArrayRule<T = string | object> = T | T[];
type RuleOption =ArrayRule | ClassArgs | ((args, context) => ArrayRule | Promise<ArrayRule>);

export function Rules(options: RuleOption, messages?: Message<{ [key: string]: string }> ): any
{
    return (target, propertyKey, d) => {
        if ( typeof propertyKey === 'symbol' ) {
            throw new SymbolKeysNotSupportedError();
        }

        const data = Reflect.getMetadata(META_DATA_VALIDATE_KEY, target) || {};

        if ( ! isClassRule(options) ) {
            data[propertyKey] = new RuleValue(options, messages);
        } else {
            data[propertyKey] = options;
        }

        Reflect.defineMetadata(META_DATA_VALIDATE_KEY, data, target);
    }
}
