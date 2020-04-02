/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/26/2020
 * Time: 8:49 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { Hasher } from '../Contracts/Hashing/Hasher';

export class BcryptHasher implements Hasher {
    protected _bcry = require('bcrypt');

    protected _rounds: number = 10;

    constructor(options: { rounds?: number } = {}) {
        this._rounds = options.rounds || this._rounds;
    }

    public check(check, hashedValue, options: any = {}): boolean {
        return this._bcry.compareSync(check, hashedValue.replace(/^\$2y/g, '$2b').replace(/^\$2x/g, '$2a'));
    }

    public make(value, options: any = {}): string {
        const salt = this._bcry.genSaltSync(this._rounds);

        return this._bcry.hashSync(value, salt).replace(/^\$2b/g, '$2y').replace(/^\$2a/g, '$2x');
    }

    public setRounds(rounds: number): this {
        this._rounds = rounds;
        return this;
    }
}
