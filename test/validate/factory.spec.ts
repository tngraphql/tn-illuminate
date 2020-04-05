/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/5/2020
 * Time: 2:01 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Application, LoadConfiguration } from '../../src/Foundation';
import { Factory } from '../../src/Foundation/Validate/Factory';


describe('factory validate', () => {
    let app;
    let validator;
    beforeAll(async () => {
        app = new Application();
        (new LoadConfiguration()).bootstrap(app);
        validator = new Factory(app);
    })

    it('register a custom rule', async () => {
        validator.extend('custom', (value, attribute, req) => {
            return value === 'foo';
        }, 'error custom');

        expect(await validator.checkValidate(validator.make({ name: null, }, { name: 'custom', }))).toBeTruthy();
        expect(await validator.checkValidate(validator.make({ name: 'foo', }, { name: 'custom', }))).toBeTruthy();
        expect(await validator.checkValidate(validator.make({ name: 'bar', }, { name: 'custom', }))).toBeFalsy();
    });

    it('register Implicit', async () => {
        validator.extendImplicit('custom', (value, attribute, req) => {
            return value === 'foo';
        }, 'error custom');

        expect(await validator.checkValidate(validator.make({ name: null, }, { name: 'custom', }))).toBeFalsy();
        expect(await validator.checkValidate(validator.make({ name: 'foo', }, { name: 'custom', }))).toBeTruthy();
        expect(await validator.checkValidate(validator.make({ name: 'bar', }, { name: 'custom', }))).toBeFalsy();
    });
})
