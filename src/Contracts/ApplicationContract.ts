import { NameSapceType } from '../Container/Container';
import { ServiceProvider } from '../Support/ServiceProvider';
import { ServiceProviderContract } from './ServiceProviderContract';

/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/14/2020
 * Time: 3:00 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export interface ApplicationContract {
    [key: string]: any;

    use(namespace: NameSapceType)

    call(target, method: string, args: any[]);

    make<T>(concrete: NameSapceType, args?: any[], binding?: boolean): T

    compileNamespace(namespace: string, prefixNamespace?: string): string;

    basePath(path?: string): string;

    resolveProvider(path: string): ServiceProvider;

    register(provider: ServiceProviderContract | string, force?: boolean);

    getLocale(): string;
}
