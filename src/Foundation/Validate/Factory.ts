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
import { RegisterAsyncCallback, RegisterCallback } from 'validatorjs';
import { PresenceVerifierInterface } from './PresenceVerifierInterface';
const Rulers = require('validatorjs/src/rules');

export class Factory {
    private resolver;

    constructor(public app: ApplicationContract) {
    }

    make(data: any, rules: { [key: string]: any }, messages?: { [key: string]: any }) {
        const validation = this.resolve(data, rules, messages);

        return validation;
    }

    removeAsyncRules(rule: string) {
        const asyncRules = new Set(Rulers.asyncRules);
        asyncRules.delete(rule);

        Rulers.asyncRules = Array.from(asyncRules);
    }

    removeImplicitRules(rule: string) {
        const implicitRules = new Set(Rulers.implicitRules);
        implicitRules.delete(rule);

        Rulers.implicitRules = Array.from(implicitRules);
    }

    async checkValidate(validation) {
        try {
            await new Promise((resolve, reject) => {
                validation.checkAsync(() => {
                    resolve(true);
                }, () => {
                    reject(false);
                });
            });
            return true;
        } catch (e) {
            return false;
        }
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

    private convertToAsync(callback): RegisterAsyncCallback {
        return async function(username, attribute, req, passes) {
            passes(await callback.bind(this)(username, attribute, req))
        };
    }

    extend(rule: string, callback: RegisterCallback, message: string) {
        this.removeAsyncRules(rule);
        Validator.registerAsync(rule, this.convertToAsync(callback), message);
    }

    extendImplicit(rule: string, callback: RegisterCallback, message: string) {
        this.removeImplicitRules(rule);
        Validator.registerAsyncImplicit(rule, this.convertToAsync(callback), message);
    }
}
