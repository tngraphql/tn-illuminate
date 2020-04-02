/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/15/2020
 * Time: 3:04 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@poppinss/utils'
import { Container } from './Container';

/**
 * Exposes the API to resolve and call bindings from the IoC container. The resolver
 * internally caches the IoC container lookup nodes to boost performance.
 */
export class Resovler {
    private lookupCache: { [key: string]: any } = {}

    /**
     * The namespace that will be used a prefix when resolving
     * bindings
     */
    private prefixNamespace = this.getPrefixNamespace()

    constructor (
        private container: Container,
        private fallbackMethod?: string,
        private rcNamespaceKey?: string,
        private fallbackNamespace?: string,
    ) {}

    /**
     * Returns the prefix namespace by giving preference to the
     * `.adonisrc.json` file
     */
    private getPrefixNamespace (): string | undefined {
        return this.fallbackNamespace;
    }

    /**
     * Resolves the namespace and returns it's lookup node
     */
    public resolve (
        namespace: string,
        prefixNamespace: string | undefined = this.prefixNamespace,
    ): any {
        const cacheKey = prefixNamespace ? `${prefixNamespace}/${namespace}` : namespace

        /**
         * Return from cache, when the node exists
         */
        const cacheNode = this.lookupCache[cacheKey]
        if (cacheNode) {
            return cacheNode
        }

        let method = this.fallbackMethod || 'handle'

        /**
         * Split the namespace to lookup the method on it. If method isn't
         * defined, we will use the conventional `handle` method.
         */
        const tokens = namespace.split('.')
        if (tokens.length > 1) {
            method = tokens.pop()!
        }

        namespace = tokens.join('.');

        if (namespace.startsWith('/')) {
            namespace = namespace.substr(1)
        } else if (prefixNamespace) {
            namespace = `${prefixNamespace.replace(/\/$/, '')}/${namespace}`
        }

        const lookupNode = this.container.lookup(namespace);

        /**
         * Raise exception when unable to resolve the binding from the container.
         * NOTE: We are not making fetching the binding, we are just checking
         * for it's existence. In case of autoloads, it's quite possible
         * that the binding check passes and the actual file is missing
         * on the disk
         */
        if (!lookupNode) {
            throw new Exception(`Unable to resolve ${tokens.join('.')} namespace from IoC container`)
        }

        this.lookupCache[cacheKey] = { ...lookupNode, method }
        return this.lookupCache[cacheKey]
    }

    /**
     * Calls the namespace.method expression with any arguments that needs to
     * be passed. Also supports type-hinting dependencies.
     */
    public call<T extends any> (
        namespace: string,
        prefixNamespace?: string,
        args?: any[],
    ): T {
        const lookupNode = typeof (namespace) === 'string'
            ? this.resolve(namespace, prefixNamespace)
            : namespace

        return this.container.call(this.container.make(lookupNode.namespace), lookupNode.method, args || [])
    }
}
