/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/9/2020
 * Time: 10:17 PM
 */

export interface Repository {
    /**
     * Read value from the pre-loaded config. Make use of the `dot notation`
     * syntax to read nested values.
     *
     * The `defaultValue` is returned when original value is `undefined`.
     *
     * @example
     * ```js
     * Config.get('database.mysql')
     * ```
     */
    get (key: string, defaultValue?: any): any;

    /**
     * Fetch and merge an object to the existing config. This method is useful
     * when you are fetching an object from the config and want to merge
     * it with some default values.
     *
     * An optional customizer can be passed to customize the merge operation.
     * The function is directly passed to [lodash.mergeWith](https://lodash.com/docs/4.17.10#mergeWith)
     * method.
     *
     * @example
     * ```js
     * // Config inside the file will be merged with the given object
     *
     * Config.merge('database.mysql', {
     *   host: '127.0.0.1',
     *   port: 3306
     * })
     * ```
     */
    merge (key: string, defaultValues: object, customizer?: Function): any;

    /**
     * Defaults allows providers to define the default config for a
     * module, which is merged with the user config
     */
    defaults (key: string, value: any): void;

    /**
     * Update in memory value of the pre-loaded config
     *
     * @example
     * ```js
     * Config.set('database.host', '127.0.0.1')
     * ```
     */
    set (key: string, value: any): void;
}