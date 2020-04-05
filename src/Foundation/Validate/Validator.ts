import { PresenceVerifierInterface } from './PresenceVerifierInterface';
import { Rule } from './Rule';
import { ApplicationContract } from '../../Contracts/ApplicationContract';

/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/19/2020
 * Time: 12:55 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const Validator = require('validatorjs');
const fs = require('fs');
const path = require('path');

Validator.useLang('vi');

class ValidatorContainer {
    static container: any;
}

Validator.verifier = undefined;

Validator.setPresenceVerifier = function(presenceVerifier: PresenceVerifierInterface) {
    this.verifier = presenceVerifier;
}

Validator.getPresenceVerifier = function (): PresenceVerifierInterface {
    return this.verifier;
}

/*Validator.prototype._replaceWildCards = function(path, nums) {
    if ( ! nums ) {
        return path;
    }

    let path2 = path;
    nums.forEach(function(value) {
        if ( Array.isArray(path2) ) {
            path2 = path2[0];
        }

        if ( typeof path2 !== 'string' ) {
            return path2;
        }

        const pos = path2.indexOf('*');
        if ( pos === -1 ) {
            return path2;
        }
        path2 = path2.substr(0, pos) + value + path2.substr(pos + 1);
    });
    if ( Array.isArray(path) ) {
        path[0] = path2;
        path2 = path;
    }
    return path2;
};*/

/*Validator.register('required', function(val, requirement, attribute) { // requirement parameter defaults to null
    let str;

    if ( val === undefined || val === null ) {
        return false;
    }

    if ( typeof val === 'object' && Object.keys(val).length ) {
        return true;
    }

    str = String(val).replace(/\s/g, '');

    return str.length > 0 ? true : false;

}, ':attribute bắt buộc nhập.');*/

/**
 *
 */
Validator.registerImplicit('filled', function(val, requirement, attribute) { // requirement parameter defaults to null
    if ( val === undefined ) {
        return true;
    }

    let str;

    if ( val === null ) {
        return false;
    }

    str = String(val).replace(/\s/g, '');
    return str.length > 0 ? true : false;

}, 'Trường :attribute không được bỏ trống.');

/*Validator.registerImplicit('without_spaces', function(val, requirement, attribute) { // requirement parameter defaults to null
    return /^\S+$/g.test(String(val || ''));
}, 'Trường :attribute không hợp lệ.');*/

/**
 * unique:model,column,except,idColumn
 */
Validator.registerAsync('unique', function(value, req, attribute, passes) { // requirement parameter defaults to null
    let ruleValue = this.ruleValue;
    if ( typeof this.ruleValue !== 'object' ) {
        req = this.getParameters();

        ruleValue = Rule.unique(req[0], req[1]).ignore(req[2], req[3]).unique;
    }

    const idColumn = ruleValue.ignore.idColumn || 'id';

    try {
        Validator.getPresenceVerifier().getCount(ruleValue.model, ruleValue.column, value, ruleValue.ignore.id, idColumn, ruleValue.where).then(({total}) => {
            passes(! total);
        });
    } catch (e) {
        console.log(e);
    }
}, 'Trường :attribute đã có trong cơ sở dữ liệu.');

/**
 * exists:model,column
 */
Validator.registerAsync('exists', function(value, req, attribute, passes) { // requirement parameter defaults to null
    let ruleValue = this.ruleValue;
    if ( typeof this.ruleValue !== 'object' ) {
        req = this.getParameters();

        ruleValue = Rule.exists(req[0], req[1]).exists;
    }

    try {
        Validator.getPresenceVerifier().getCount(ruleValue.model, ruleValue.column, value, undefined, undefined, ruleValue.where).then(({total}) => {
            if ( Array.isArray(value) && value.length > 1 && total !== value.length ) {
                passes(false);
            } else {
                passes(!! total);
            }
        });
    } catch (e) {
        console.log(e);
    }
}, 'Giá trị đã chọn trong trường :attribute không hợp lệ.');

export { Validator };
