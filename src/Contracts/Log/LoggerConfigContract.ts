import { DestinationStream, Level, PrettyOptions, redactOptions, SerializerFn, TimeFn } from 'pino';

/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/21/2020
 * Time: 7:12 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export type LoggerConfigContract = {
    name: string;
    level: Level | 'silent' | string;
    enabled: boolean;
    messageKey?: string;
    safe?: boolean;
    crlf?: boolean;
    useLevelLabels?: boolean;
    levelKey?: string;
    timestamp?: TimeFn | boolean;
    customLevels?: {
        [key: string]: number;
    };
    useOnlyCustomLevels?: boolean;
    redact?: string[] | redactOptions;
    prettyPrint?: boolean | PrettyOptions;
    base?: {
        [key: string]: any;
    } | null;
    serializers?: {
        [key: string]: SerializerFn;
    };
    stream?: DestinationStream;
};