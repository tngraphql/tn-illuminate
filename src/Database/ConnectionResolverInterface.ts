/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/18/2020
 * Time: 4:44 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { QueryClientContract } from '@ioc:Adonis/Lucid/Database';

export interface ConnectionResolverInterface {
    primaryConnectionName: string;

    /**
     * Get a database connection instance.
     *
     * @param  string|null  $name
     * @return \Illuminate\Database\ConnectionInterface
     */
    connection(name?: string): QueryClientContract;

    /**
     * Get the default connection name.
     *
     * @return string
     */
    getDefaultConnection();

    /**
     * Set the default connection name.
     *
     * @param  string  $name
     * @return void
     */
    setDefaultConnection(name);

    from(name: string);
}