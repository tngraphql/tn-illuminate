/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/9/2020
 * Time: 9:25 PM
 */
import { BindingResolutionException } from './BindingResolutionException';
import * as path from 'path';
import { normalize } from 'path';
import { InvalidArgumentException } from './InvalidArgumentException';
import { LogicException } from './LogicException';
import { ensureIsFunction, isClass, isEsm } from '../utils';
import { Injector } from './Injector';
import _ = require('lodash');
import { Resovler } from './Resovler';
import { Macroable } from 'macroable/build';

export type Binding = {
    id: any,
    value: BindCallback,
    singleton: boolean,
    cachedValue?: unknown,
}

/**
 * Shape of lookup node pulled using `ioc.lookup` method. This node
 * can be passed to `ioc.use`, or `ioc.make` or `ioc.useEsm` to
 * skip many checks and resolve the binding right away.
 */
export type LookupNode = {
    namespace: NameSapceType,
    type: 'binding' | 'autoload',
}

export type BindCallback = (app?: Container) => unknown

export type NameSapceType = Function | string;

/**
 * Shape of autoloaded cache entry
 */
export type AutoloadCacheItem = {
    diskPath: string,
    cachedValue: any,
}

export class Container extends Macroable {
    /**
     * Required by macroable
     */
    protected static macros = {}
    protected static getters = {}

    static instance: Container;

    private bindings: Map<NameSapceType, Binding> = new Map<NameSapceType, Binding>();

    /**
     * Copy of aliases
     */
    private aliases: { [alias: string]: NameSapceType; } = {};

    /**
     * Autoloaded directories under a namespace
     */
    public autoloads: { [namespace: string]: string; } = {};

    /**
     * An array of autoloaded aliases, stored along side with
     * `autoloads` for a quick lookup on keys
     */
    public autoloadedAliases: string[] = [];

    /**
     * Autoloaded cache to improve the `require` speed, which is dog slow.
     */
    private autoloadsCache: Map<string, AutoloadCacheItem> = new Map<string, AutoloadCacheItem>();

    private injector = new Injector(this)

    /**
     * Flush the container of all bindings and resolved instances.
     *
     * @return void
     */
    public flush() {
        this.aliases = {};
        this.bindings = new Map<NameSapceType, Binding>();
        this.autoloads = {};
        this.autoloadedAliases = [];
        this.autoloadsCache = new Map<string, AutoloadCacheItem>();
    }

    /**
     * Set the globally available instance of the container.
     *
     * @return static
     */
    public static getInstance(): any {
        if ( ! this.instance ) {
            this.instance = new this;
        }

        return this.instance;
    }

    /**
     * Set the shared instance of the container.
     */
    public static setInstance(container): any | null {
        return this.instance = container;
    }

    /**
     * Use the binding by resolving it from the container. The resolve method
     * does some great work to resolve the value for you.
     *
     * 1. The name will be searched for an existing binding.
     * 2. Checked against aliases.
     * 3. Checked against autoloaded directories.
     * 4. Fallback to Node.js `require` call.
     *
     * @example
     * ```js
     * app.use('View')                // alias
     * app.use('Module/Src/View')     // binding
     * app.use('App/Services/User')   // Autoload
     * app.use('lodash')              // Fallback to Node.js require
     * ```
     */
    public use<T>(namespace: NameSapceType): T {
        const lookedupNode = this.lookup(namespace);

        if ( ! lookedupNode ) {
            throw new BindingResolutionException(`Resolve [${ namespace }] does not exists.`);
        }

        return this.resolve(lookedupNode);
    }

    /**
     * Register a singleton binding in the container.
     *
     * @example
     * ```js
     * app.singleton('App/User', function () {
     *  return new User()
     * })
     * ```
     */
    public singleton(namespace: NameSapceType, concrete: Function | BindCallback) {
        this.bind(namespace, concrete, true);
    }

    /**
     * Register a binding with the container.
     *
     * @example
     * ```js
     * app.bind('App/User', function () {
     *  return new User()
     * })
     * ```
     */
    public bind(namespace: NameSapceType, concrete: Function | BindCallback, singleton: boolean = false) {
        if ( ! namespace ) {
            throw new InvalidArgumentException('Empty namespace cannot be used as IoC container reference');
        }

        ensureIsFunction(concrete, 'ioc.bind expect 2nd argument to be a function');

        if ( isClass(concrete) ) {
            concrete = this.getClosure(namespace, concrete);
        }

        const binding: Binding = {
            id: namespace,
            value: concrete as BindCallback,
            singleton
        };

        this.bindings.set(namespace, binding);
    }

    /**
     * Get the callback to be used when building a type.
     *
     * @param namespace
     * @param concrete
     */
    public getClosure(namespace: NameSapceType, concrete: Function | BindCallback) {
        const instance = this;
        return function() {
            const args = _.toArray(arguments);
            args.shift();
            return instance.make(concrete, args, false);
        }
    }

    /**
     * Define alias for an existing binding. IoC container doesn't handle uniqueness
     * conflicts for you and it's upto you to make sure that all aliases are
     * unique.
     *
     * Use method [[hasAlias]] to know, if an alias already exists.
     */
    public alias(namespace: NameSapceType, alias: string): void {
        this.aliases[alias] = namespace;
    }

    public make<T>(concrete: NameSapceType, args = [], binding = true): T {
        if ( typeof concrete === 'string' ) {
            const lookedupNode = this.lookup(concrete);

            if ( ! lookedupNode ) {
                throw new BindingResolutionException(`Resolve [${ concrete }] does not exists.`);
            }

            return this.resolveAndMake(lookedupNode, args, binding);
        }
        return this.injector.injectDependencies(concrete as any, binding, args);
    }

    /**
     * Resolves a namespace and injects it's dependencies to it
     */
    public resolveAndMake(node: LookupNode, args?: string[], binding = true) {
        switch (node.type) {
        case 'binding':
            return this.resolveBinding(node.namespace, args || [])
        case 'autoload':
            let value = this.resolveAutoload(node.namespace as string)

            /**
             * We return an instance of default export for esm modules
             */
            return this.make(value, args, binding);
        }
    }

    /**
     * Resolve the value for a namespace by trying all possible
     * combinations of `bindings`, `aliases`, `autoloading`
     * and finally falling back to `nodejs require`.
     */
    public resolve(node: LookupNode, args = []) {
        switch (node.type) {
        case 'autoload':
            return this.resolveAutoload(node.namespace as string);
        case 'binding':
            return this.resolveBinding(node.namespace, args || []);
        }
    }

    /**
     * Returns the binding return value. This method must be called when
     * [[hasBinding]] returns true.
     */
    private resolveBinding(namespace: NameSapceType, args = []) {
        const binding = this.bindings.get(namespace);

        if ( ! binding ) {
            throw new Error(`Cannot resolve ${ namespace } binding from the IoC Container`)
        }

        let value: any;
        if ( binding.singleton && binding.cachedValue !== undefined ) {
            value = binding.cachedValue;
        } else if ( binding.singleton ) {
            value = binding.cachedValue = binding.value.bind(binding.value, this).apply(null, args);
        } else {
            value = binding.value.bind(binding.value, this).apply(null, args);
        }

        return value;
    }

    /**
     * Load a file from the disk using Node.js require method. The output of
     * require is further cached to improve peformance.
     *
     * Make sure to call this method when [[isAutoloadNamespace]] returns true.
     */
    private resolveAutoload(namespace: string) {
        const cacheEntry = this.autoloadsCache.get(namespace)

        /**
         * Require the module and cache it to improve performance
         */
        if ( cacheEntry ) {
            return cacheEntry.cachedValue
        }

        const baseNamespace = this.getAutoloadBaseNamespace(namespace)!

        const diskPath = namespace.replace(baseNamespace, this.autoloads[baseNamespace]);

        const absPath = require.resolve(normalize(diskPath));
        const name = path.basename(absPath, path.extname(absPath));
        const module = require(absPath);
        let cachedValue = module;

        if ( isEsm(module) ) {
            if ( module.default ) {
                cachedValue = module.default;
            } else if ( module[name] ) {
                cachedValue = module[name];
            }
        }

        this.autoloadsCache.set(namespace, { diskPath: absPath, cachedValue });

        return this.autoloadsCache.get(namespace)!.cachedValue
    }

    /**
     * Returns the base namespace for an autoloaded namespace.
     *
     * @example
     * ```js
     * app.autoload(join(__dirname, 'app'), 'App')
     *
     * app.getAutoloadBaseNamespace('App/Services/Foo') // returns App
     * ```
     */
    public getAutoloadBaseNamespace(namespace: string): string | undefined {
        return this.autoloadedAliases.find((alias) => namespace.startsWith(`${ alias }/`))
    }

    public compileNamespace(namespace: string, prefixNamespace?: string): string {
        if ( typeof namespace !== 'string') {
            return namespace;
        }
        if (namespace.startsWith('/')) {
            namespace = namespace.substr(1);
        } else if (prefixNamespace) {
            namespace = `${prefixNamespace.replace(/\/$/, '')}/${namespace}`;
        }
        return namespace;
    }

    /**
     * Lookup a namespace and return it's lookup node. The lookup node can speed
     * up resolving of namespaces via `use`, `useEsm` or `make` methods.
     */
    public lookup(namespace: NameSapceType, prefixNamespace?: string): LookupNode | null {
        if ( ! namespace ) {
            throw new InvalidArgumentException(`Empty key cannot be used as IoC container reference`);
        }

        if ( typeof namespace === 'string' ) {
            namespace = this.compileNamespace(namespace as string, prefixNamespace);
        }

        if ( this.hasBinding(namespace) ) {
            return {
                type: 'binding',
                namespace
            };
        }

        if ( this.hasAlias(namespace as string) ) {
            return {
                type: 'binding',
                namespace: this.getAliasNamespace(namespace as string)
            };
        }

        /**
         * Namespace is part of pre-defined autoloads. We do not check
         * for the module existence
         */
        if ( this.isAutoloadNamespace(namespace as string) ) {
            return {
                type: 'autoload',
                namespace: namespace,
            }
        }

        return null;
    }

    /**
     * Returns a boolean telling if binding for a given namespace
     * exists or not. Also optionally check for aliases too.
     *
     * @example
     * ```js
     * app.hasBinding('Module/Src/View')    // namespace
     * app.hasBinding('View')               // alias
     * ```
     */
    public hasBinding(namespace: NameSapceType, checkAliases = false): boolean {
        const binding = this.bindings.has(namespace);

        if ( ! binding && checkAliases ) {
            return this.bindings.has(this.getAliasNamespace(namespace as string));
        }

        return binding
    }

    /**
     * Returns a boolean telling if an alias
     * exists
     */
    public hasAlias(name: string): boolean {
        if ( typeof name !== 'string' ) {
            return false;
        }

        return !! this.aliases[name];
    }

    /**
     * Returns the complete namespace for a given alias. To avoid
     * `undefined` values, it is recommended to use `hasAlias`
     * before using this method.
     */
    public getAliasNamespace(namespace: string): NameSapceType | undefined {
        if ( ! this.hasAlias(namespace) ) {
            return namespace;
        }

        if ( this.aliases[namespace] === namespace ) {
            throw new LogicException(`[${ namespace }] is aliased to itself.`)
        }

        return this.getAliasNamespace(this.aliases[namespace] as string);
    }

    /**
     * Returns a boolean telling if namespace is part of autoloads or not.
     * This method results may vary from the [[use]] method, since
     * the `use` method gives prefrence to the `bindings` first.
     *
     * ### NOTE:
     * Check the following example carefully.
     *
     * @example
     * ```js
     * // Define autoload namespace
     * app.autoload(join(__dirname, 'app'), 'App')
     *
     * app.bind('App/Services/Foo', () => {
     * })
     *
     * // return true
     * app.isAutoloadNamespace('App/Services/Foo')
     *
     * // Returns value from `bind` and not disk
     * app.use('isAutoloadNamespace')
     * ```
     */
    public isAutoloadNamespace(namespace: string): boolean {
        return !! this.getAutoloadBaseNamespace(namespace)
    }

    /**
     * Execute a callback by resolving bindings from the container and only
     * executed when all bindings exists in the container.
     *
     * This is a clean way to use bindings, when you are not that user application
     * is using them or not.
     *
     * ```js
     * boot () {
     *  this.app.with(['App/Src/Auth'], (Auth) => {
     *    Auth.extend('mongo', 'serializer', function () {
     *      return new MongoSerializer()
     *    })
     *  })
     * }
     * ```
     */
    public with(namespaces: NameSapceType[], callback: (...args: any[]) => void): void {
        if ( namespaces.every((namespace) => this.hasBinding(namespace, true)) ) {
            callback(...namespaces.map((namespace) => this.use(namespace)));
        }
    }

    /**
     * Define an alias for an existing directory and require
     * files without fighting with relative paths.
     * ```
     */
    public autoload(directoryPath: string, namespace: string): void {
        /**
         * Store namespaces in an array for faster lookup
         */
        this.autoloadedAliases.push(namespace)
        this.autoloads[namespace] = directoryPath
    }

    public call(target, method, args: any[] = []) {
        return this.injector.injectMethodDependencies(target, method, args);
    }

    /**
     * Returns the resolver instance to resolve Ioc container bindings with
     * little ease. Since, the IoCResolver uses an in-memory cache to
     * improve the lookup speed, we suggest keeping a reference to
     * the output of this method to leverage caching
     */
    public getResolver (
        fallbackMethod?: string,
        rcNamespaceKey?: string,
        fallbackNamespace?: string,
    ): Resovler {
        return new Resovler(this, fallbackMethod, rcNamespaceKey, fallbackNamespace);
    }
}
