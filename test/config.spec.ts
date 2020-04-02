/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/10/2020
 * Time: 10:39 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Repository } from '../src/config/Repository';
import { join } from 'path'

describe('Config', () => {
    it('init', async () => {
        const config = new Repository();
        expect(config.get('')).toBe(undefined);
        expect(config.get(undefined)).toBe(undefined);
        expect(config.get(undefined, {})).toEqual({});
        expect(config.get(undefined, '0')).toBe('0');
    });

    it('merge config with given defaults', async () => {
        const config = new Repository({
            app: {
                logger: {
                    driver: 'file',
                },
            },
        });

        expect(config.merge('app.logger', { filePath: 'foo' })).toEqual({
            driver: 'file',
            filePath: 'foo'
        });
    });

    it('define merge config customizer', async () => {
        const config = new Repository({
            app: {
                logger: {
                    driver: 'file',
                },
            },
        });

        expect(config.merge('app.logger', { filePath: 'foo' }, (_objValue, _srcValue, key) => {
            if ( key === 'driver' ) {
                return 'memory'
            }
        })).toEqual({
            driver: 'memory',
            filePath: 'foo',
        });
    })

    it('update in-memory config value', async () => {
        const config = new Repository({
            app: {
                logger: {
                    driver: 'file',
                },
            },
        })
        config.set('app.logger', { driver: 'memory' });

        expect(config.get('app.logger')).toEqual({ driver: 'memory' });
    })

    it('merge defaults with existing user defaults', async () => {
        const config = new Repository({
            app: {
                logger: {
                    driver: 'file',
                },
            },
        })
        config.defaults('app.logger', { filePath: join(__dirname), driver: 'console' });

        expect(config.get('app.logger')).toEqual({
            filePath: join(__dirname),
            driver: 'file',
        });
    })

    it('merge defaults with existing user defaults when they are missing', async () => {
        const config = new Repository({
            app: {},
        })

        config.defaults('app.logger', { filePath: join(__dirname) });

        expect(config.get('app.logger')).toEqual({
            filePath: join(__dirname),
        });
    })
});