/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/24/2020
 * Time: 2:19 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export type I18nConfigContract = {
    // setup some locales - other locales default to en silently
    locales?: string[];

    // fall back from Dutch to German
    fallbacks?: { [key: string]: string };

    // you may alter a site wide default locale
    defaultLocale?: string,

    // sets a custom cookie name to parse locale settings from - defaults to NULL
    cookie?: string,

    // query parameter to switch locale (ie. /home?lang=ch) - defaults to NULL
    queryParameter?: string,

    // where to store json files - defaults to './locales' relative to modules directory
    directory?: string,

    // control mode on directory creation - defaults to NULL which defaults to umask of process user. Setting has no effect on win.
    directoryPermissions?: string,

    // watch for changes in json files to reload locale on updates - defaults to false
    autoReload?: boolean,

    // whether to write new locale information to disk - defaults to true
    updateFiles?: boolean,

    // sync locale information across all files - defaults to false
    syncFiles?: boolean,

    // what to use as the indentation unit - defaults to "\t"
    indent?: string,

    // setting extension of json files - defaults to '.json' (you might want to set this to '.js' according to webtranslateit)
    extension?: string,

    // setting prefix of json files name - default to none '' (in case you use different locale files naming scheme (webapp-en.json), rather then just en.json)
    prefix?: string,

    // enable object notation - default to false
    objectNotation?: boolean,

    // setting of log level DEBUG - default to require('debug')('i18n:debug')
    logDebugFn?: (msg) => void,

    // setting of log level WARN - default to require('debug')('i18n:warn')
    logWarnFn?: (msg) => void,

    // setting of log level ERROR - default to require('debug')('i18n:error')
    logErrorFn?: (msg) => void,

    // object or [obj1, obj2] to bind the i18n api and current locale to - defaults to null
    register?: any[],


    // Downcase locale when passed on queryParam; e.g. lang=en-US becomes
    // en-us.  When set to false, the queryParam value will be used as passed;
    // e.g. lang=en-US remains en-US.
    preserveLegacyCase?: boolean
}