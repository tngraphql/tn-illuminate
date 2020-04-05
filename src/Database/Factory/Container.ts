/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/23/2020
 * Time: 7:29 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class Container {
  protected bindings: any[] = []

  public singleton (name: string, value: any) {
    this.bindings.push({ name, value })
  }

  public use (name: string) {
    const value = this.bindings.find(binding => binding.name === name)

    return value.value(this)
  }
}
