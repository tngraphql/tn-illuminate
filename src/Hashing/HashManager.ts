/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/26/2020
 * Time: 5:00 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { Manager } from '../Support/Manager';
import { Hasher } from '../Contracts/Hashing/Hasher';
import { BcryptHasher } from './BcryptHasher';

export class HashManager extends Manager implements Hasher {
    public getDefaultDriver() {
        return this.config.get('hashing.driver', 'bcrypt');
    }

    public createBcryptDriver() {
        return new BcryptHasher(this.config.get('hashing.bcrypt', {}));
    }

    make(data, options: any = {}): string {
        return this.driver().make(data, options);
    }

    check(check, hashedValue, options = {}): boolean {
        return this.driver().check(check, hashedValue, options)
    }
}
