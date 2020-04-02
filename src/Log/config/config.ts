/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/21/2020
 * Time: 7:11 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { Env } from '../../Support/Env';
import { LoggerConfigContract } from '../../Contracts/Log/LoggerConfigContract';

const logger: LoggerConfigContract = {
    /*
    |--------------------------------------------------------------------------
    | Application name
    |--------------------------------------------------------------------------
    |
    | The name of the application you want to add to the log. It is recommended
    | to always have app name in every log line.
    |
    | The `APP_NAME` environment variable is set by reading `appName` from
    | `.adonisrc.json` file.
    |
    */
    name: Env.get('APP_NAME') as string,

    /*
    |--------------------------------------------------------------------------
    | Toggle logger
    |--------------------------------------------------------------------------
    |
    | Enable or disable logger application wide
    |
    */
    enabled: true,

    /*
    |--------------------------------------------------------------------------
    | Logging level
    |--------------------------------------------------------------------------
    |
    | The level from which you want the logger to flush logs. It is recommended
    | to make use of the environment variable, so that you can define log levels
    | at deployment level and not code level.
    |
    */
    level: Env.get('LOG_LEVEL', 'info') as string,

    /*
    |--------------------------------------------------------------------------
    | Pretty print
    |--------------------------------------------------------------------------
    |
    | It is highly advised NOT to use `prettyPrint` in production, since it
    | can have huge impact on performance.
    |
    */
    prettyPrint: Env.get('NODE_ENV') === 'development',
}

export = logger;
