import {ClassType, createMethodDecorator, ResolverData} from '@tngraphql/graphql';
import {compileMessages, compileRules, fnMessage, handlerRulers, merge} from '../Foundation/Validate/helpers';
import {ValidationError} from './Rules';
import {Validator} from '../Support/Facades/Validator';

/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/19/2020
 * Time: 11:18 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

type Message<T> = T | ((context?: any, args?: any) => T)

export function ValidateArgs(
    type: ClassType | { [key: string]: string | string[] | object },
    messages?: Message<{ [key: string]: string }>) {
    return createMethodDecorator(async ({args, context}: ResolverData<any>, next) => {
        messages = fnMessage(messages, context, args);

        const instance = handlerRulers(type, args);

        if (context.lang) {
            Validator.useLang(context.lang.getLocale());
        }

        const validation = Validator.make(args, compileRules(instance), merge(compileMessages(instance, '', context, args), messages));

        // Check validate.
        await new Promise((resolve, reject) => {
            validation.checkAsync(() => {
                resolve(true);
            }, () => {
                reject({});
            });
        }).catch((err) => {
            throw new ValidationError(validation)
        });

        return next();
    });
}
