/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/21/2020
 * Time: 10:21 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { Injector } from '../Container';
import { isClass } from '../utils';
import { CannotInjectError } from '../Container/CannotInjectError';
import { ApplicationContract } from '../Contracts/ApplicationContract';
import { ClassType } from 'tn-graphql';

export const OPTIONAL_DEPS_METADATA = 'optional:paramtypes';

export const OPTIONAL_PROPERTY_DEPS_METADATA = 'optional:properties_metadata';


export function Inject(typeOrName?: ((type?: any) => Function) | string | ClassType<any>): Function {
    return (target, propertyName, index) => {

        if (!typeOrName) {
            typeOrName = () => (Reflect as any).getMetadata('design:type', target, propertyName);
        }

        Injector.registerHandler({
            object: target,
            propertyName,
            index,
            value: () => {
                let identifier: any;
                if ( typeof typeOrName === 'string' ) {
                    identifier = typeOrName;

                } else if ( isClass(typeOrName) ) {
                    identifier = typeOrName;
                } else {
                    identifier = (typeOrName as any)();
                }

                if ( identifier === Object ) {
                    throw new CannotInjectError(target, propertyName);
                }

                return identifier;
            }
        })

    };

}