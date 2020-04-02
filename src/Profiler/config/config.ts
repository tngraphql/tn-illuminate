/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/21/2020
 * Time: 7:11 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { ProfilerConfigContract } from '../../Contracts/Profiler/ProfilerConfigContract';

const profiler: ProfilerConfigContract = {
    /*
    |--------------------------------------------------------------------------
    | Toggle profiler
    |--------------------------------------------------------------------------
    |
    | Enable or disable profiler
    |
    */
    enabled: true,

    /*
    |--------------------------------------------------------------------------
    | Blacklist actions/row labels
    |--------------------------------------------------------------------------
    |
    | Define an array of actions or row labels that you want to disable from
    | getting profiled.
    |
    */
    blacklist: [],

    /*
    |--------------------------------------------------------------------------
    | Whitelist actions/row labels
    |--------------------------------------------------------------------------
    |
    | Define an array of actions or row labels that you want to whitelist for
    | the profiler. When whitelist is defined, then `blacklist` is ignored.
    |
    */
    whitelist: [],
}

export = profiler;
