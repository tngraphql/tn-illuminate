/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/5/2020
 * Time: 6:07 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Validator } from '../../src/Foundation/Validate/Validator';

describe('validator', () => {

    it('should have validation a geven null fails', async () => {
        var validator = new Validator({
            foo: null
        }, {
            'foo': 'filled'
        });
        expect(validator.passes()).toBeFalsy();
        expect(validator.fails()).toBeTruthy();
    });

    it('should have validate a geven undefine passes', async () => {
        var validator = new Validator({
            foo: undefined
        }, {
            'foo': 'filled'
        });
        expect(validator.fails()).toBeFalsy();
        expect(validator.passes()).toBeTruthy();
    });

    it('should have validate a geven boolean false passes', async () => {
        var validator = new Validator({
            foo: false
        }, {
            'foo': 'filled'
        });
        expect(validator.fails()).toBeFalsy();
        expect(validator.passes()).toBeTruthy();
    });

    it('should have validate a geven boolean true passes', async () => {
        var validator = new Validator({
            foo: true
        }, {
            'foo': 'filled'
        });
        expect(validator.fails()).toBeFalsy();
        expect(validator.passes()).toBeTruthy();
    });
    it('should have validate a geven empty fails', async () => {
        var validator = new Validator({
            foo: ''
        }, {
            'foo': 'filled'
        });
        expect(validator.passes()).toBeFalsy();
        expect(validator.fails()).toBeTruthy();
    });
    it('should have validate a geven number passes', async () => {
        var validator = new Validator({
            foo: 0
        }, {
            'foo': 'filled'
        });
        expect(validator.fails()).toBeFalsy();
        expect(validator.passes()).toBeTruthy();
    });
    it('should have validate a geven many value passes', async () => {
        var validator = new Validator({
            foo: [0]
        }, {
            'foo': 'filled'
        });
        expect(validator.fails()).toBeFalsy();
        expect(validator.passes()).toBeTruthy();
    });
    it('should have validate a geven empty array fails', async () => {
        var validator = new Validator({
            foo: []
        }, {
            'foo': 'filled'
        });
        expect(validator.passes()).toBeFalsy();
        expect(validator.fails()).toBeTruthy();
    });

})
