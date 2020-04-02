/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/19/2020
 * Time: 1:13 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { Validator } from './Validator';
import { ApplicationContract } from '../../Contracts/ApplicationContract';
import { RegisterAsyncCallback } from 'validatorjs';
import { PresenceVerifierInterface } from './PresenceVerifierInterface';

export class Factory {
    private resolver;

    constructor(public app: ApplicationContract) {
    }

    make(data: any, rules: { [key: string]: any }, messages?: { [key: string]: any }) {
        const validator = this.resolve(data, rules, messages);

        return validator;
    }

    resolve(data: any, rules: { [key: string]: any }, messages?: { [key: string]: any }) {
        if ( ! this.resolver ) {
            this.useLang(this.app.getLocale());
            return new Validator(data, rules, messages);
        }
    }

    useLang(locale: string = 'vi') {
        Validator.useLang(locale);
        return this;
    }

    setPresenceVerifier(value: PresenceVerifierInterface) {
        Validator.setPresenceVerifier(value);
    }

    extend(rule: string, callback: RegisterAsyncCallback, message: string) {
        Validator.registerAsync(rule, callback, message);
    }

    extendImplicit(rule: string, callback: RegisterAsyncCallback, message: string) {
        Validator.registerImplicit(rule, callback, message);
    }
}
