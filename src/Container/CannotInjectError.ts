/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/21/2020
 * Time: 1:32 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class CannotInjectError extends Error {
    name = 'ServiceNotFoundError';

    constructor(target: Object, propertyName: string) {
        super(
            `Cannot inject value into "${target.constructor.name}.${propertyName}". ` +
            `Please make sure you setup reflect-metadata properly and you don't use interfaces without service tokens as injection value.`
        );

        Object.setPrototypeOf(this, CannotInjectError.prototype);
    }
}