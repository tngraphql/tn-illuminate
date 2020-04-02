/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/24/2020
 * Time: 2:17 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { I18nConfigContract } from '../Contracts/I18nConfigContract';

const config: I18nConfigContract = {
    locales: ['en', 'vi'],
    directory: process.cwd() + '/locales',
    objectNotation: false,
    // you may alter a site wide default locale
    defaultLocale: 'vi'
}

export = config;