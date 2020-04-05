/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/5/2020
 * Time: 9:29 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export function forwardRef(fn: () => any): any {
    return () => ({
        forwardRef: true,
        value: fn
    })
}
