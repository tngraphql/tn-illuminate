/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/27/2020
 * Time: 6:31 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */


import { Application, LoadConfiguration } from '../src/Foundation';
import { HashManager } from '../src/Hashing/HashManager';
import { InvalidArgumentException } from '../src/Container';
import { BcryptHasher } from '../src/Hashing/BcryptHasher';

function getHash() {
    const app = new Application();
    new LoadConfiguration().bootstrap(app);

    const hash = new HashManager(app);
    return hash;
}

describe('Manager', () => {
    it('Invalid argument exception should be thrown if no driver was found', async () => {
        const hash = getHash();

        expect(() => hash.driver('test')).toThrow(InvalidArgumentException);
    });

    it('Invalid argument exception should be thrown if no driver default', async () => {
        const hash: any = getHash();

        hash.config.set('hashing', {
            driver: null
        });

        expect(() => hash.driver()).toThrow(InvalidArgumentException);
    });

    it('register custom driver', async () => {
        const hash: any = getHash();
        let num = 0;
        hash.extend('customDriver', () => {
            num++;
            return new BcryptHasher();
        });

        expect(Object.keys(hash._customCreators).includes('customDriver')).toBeTruthy();
        expect(hash.driver('customDriver')).toBeInstanceOf(BcryptHasher);
        expect(num).toBe(1);
        expect(Array.from(hash.getDrivers().keys()).includes('customDriver')).toBeTruthy();
        expect(hash.getDrivers().size).toBe(1);
    });
});
