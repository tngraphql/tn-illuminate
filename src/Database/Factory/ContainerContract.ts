/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/23/2020
 * Time: 7:28 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export interface ContainerContract {
  use(name: string): any;

  singleton(name: string, value: any): void;
}
