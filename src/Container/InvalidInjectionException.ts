/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/14/2020
 * Time: 5:52 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { Exception } from '@poppinss/utils/build';

export class InvalidInjectionException extends Exception {
    public static invoke (value: any, parentName: string, index: number) {
        const primitiveName = `{${value.name} Constructor}`
        return new this(
            `Cannot inject ${primitiveName} to {${parentName}} at position ${index + 1}`,
        )
    }
}