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
import { ensureIsFunction, isClass, isEsm, isObject, namespaceToString } from '../utils';
import { Injector, Type } from './Injector';
import { Resovler } from './Resovler';
import { IocProxyClass, IoCProxyObject } from './IoCProxy';
import _ = require('lodash');

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

export type NameSapceType = Function | string | symbol;

/**
 * Shape of autoloaded cache entry
 */
export type AutoloadCacheItem = {
    diskPath: string,
    cachedValue: any,
}

const handler = {
    get<T extends Container>(target: T, p: string | number | symbol, receiver: any): any {
        if ( ! Reflect.has(target, p) ) {
            if ( ['asymmetricMatch', Symbol.iterator, Symbol.toStringTag].includes(p as any) ) {
                return;
            }

            return target.make(p as string);
        }
        return Reflect.get(target, p, receiver);
    },
    set(target: any, p: string | number | symbol, value: any, receiver: any): boolean {
        if ( ! Reflect.has(target, p) ) {
            if ( [Symbol.iterator, Symbol.toStringTag].includes(p as any) ) {
                return;
            }

            target.bind(p, typeof value === 'function' ? value : () => {
                return value;
            });

            return true;
        }

        return Reflect.set(target, p, value, receiver);
    }
}

export class Container {
    constructor() {
        return new Proxy(this, handler);
    }

    protected _basePath: string = process.cwd();

    static instance: Container = undefined;

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

    private injector = {
        injectMethodDependencies: <T = any>(target, method, args): T =>{
            return (new Injector(this)).injectMethodDependencies(target, method, args);
        },
        injectDependencies: <T = any>(target: Type<any> | any, binding = true, args: any = []): T => {
            return (new Injector(this)).injectDependencies<T>(target, binding, args);
        }
    };

    private _fakes: Map<NameSapceType, any> = new Map<NameSapceType, any>();

    private _proxiesEnabled: boolean = false;

    protected _instances: Map<any, any> = new Map<any, any>();

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
    public static getInstance<T = any>(): T {
        if ( ! this.instance ) {
            this.instance = new this;
        }

        return this.instance as any;
    }

    /**
     * Set the shared instance of the container.
     */
    public static setInstance(container): any | null {
        return this.instance = container;
    }

    /**
     * Instruct IoC container to use proxies when returning
     * bindings from `use` and `make` methods.
     */
    public useProxies(enable: boolean = true): this {
        this._proxiesEnabled = !! enable
        return this
    }

    /**
     * Wraps object and class to a proxy for enabling the fakes
     * API
     */
    private wrapAsProxy<T extends any>(namespace: NameSapceType, value: any): T {
        /**
         * Wrap objects inside proxy
         */
        if ( isObject(value) ) {
            return (new IoCProxyObject(namespace, value, this as any) as unknown) as T
        }

        /**
         * Wrap class inside proxy
         */
        if ( isClass(value) ) {
            return (IocProxyClass(namespace, value, this as any) as unknown) as T
        }

        return value
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
    public use<T = any>(namespace: NameSapceType): T {
        const lookedupNode = this.lookup(namespace);

        if ( ! lookedupNode ) {
            throw new BindingResolutionException(`Resolve [${ namespaceToString(namespace) }] does not exists.`);
        }

        let value: any = this.resolve(lookedupNode);

        if ( ! this._proxiesEnabled ) {
            return value as T;
        }

        return this.wrapAsProxy<T>(lookedupNode.namespace, value)
    }

    public instance<T>(name: string, instance: any): T {
        this._instances.set(name, instance);

        return instance;
    }

    public useFake<T>(namespace: NameSapceType, value): T {
        const fake = this._fakes.get(namespace)
        if ( ! fake ) {
            throw new Error(`Cannot find fake for ${ namespaceToString(namespace) }`)
        }

        fake.cachedValue = fake.cachedValue || fake.value(this, value);
        return fake.cachedValue as T
    }

    /**
     * A boolean telling if a fake exists for a binding or
     * not.
     */
    public hasFake(namespace: NameSapceType): boolean {
        return this._fakes.has(namespace)
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

        this.dropStaleInstances(namespace);

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
     * Register a fake for an existing binding. The fakes only work when
     * `TNGRAPHQL_IOC_PROXY` environment variable is set to `true`. tngraphql
     * will set it to true automatically during testing.
     *
     * NOTE: The return value of fakes is always cached, since multiple
     * calls to `use` after that should point to a same return value.
     *
     * @example
     * ```ts
     * app.fake('App/User', function () {
     *  return new FakeUser()
     * })
     * ```
     */
    public fake(namespace: NameSapceType, concrete: Function | BindCallback) {
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
            singleton: false
        };

        this._fakes.set(namespace, binding);
    }

    /**
     * Get the callback to be used when building a type.
     *
     * @param namespace
     * @param concrete
     */
    public getClosure(namespace: NameSapceType, concrete: Function | BindCallback) {
        const instance = this;
        return function(app, args) {
            return instance.injector.injectDependencies(concrete as any, false, args);
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

    public make<T = any>(concrete: NameSapceType, args = [], binding = true): T {
        /**
         * If value is not a namespace string and not a lookup node,
         * then we make the value as it is.
         *
         * Also we do not support fakes for raw values and hence there is
         * no point in wrapping it to a proxy
         */
        if ( typeof (concrete) !== 'string' && ! this.lookup(concrete) ) {
            return this.injector.injectDependencies(concrete as any, binding, args) as T
        }

        const lookedupNode = this.lookup(concrete);

        if ( ! lookedupNode ) {
            throw new BindingResolutionException(`Resolve [${ namespaceToString(concrete) }] does not exists.`);
        }

        let value = this.resolveAndMake(lookedupNode, args, binding);

        /**
         * When not using proxies, then we must return the value untouched
         */
        if ( ! this._proxiesEnabled || isEsm(value) ) {
            return value as T
        }

        return this.wrapAsProxy<T>(lookedupNode.namespace, value);
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

        const needsContextualBuild = (args && args.length);

        if ( this._instances.has(namespace) && ! needsContextualBuild ) {
            return this._instances.get(namespace);
        }

        if ( ! binding ) {
            throw new Error(`Cannot resolve ${ namespaceToString(namespace) } binding from the IoC Container`)
        }

        let value = binding.value.bind(binding.value, this).apply(null, [args]);

        if ( binding.singleton && ! needsContextualBuild ) {
            this.instance(namespace as string, value);
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
        if ( typeof namespace !== 'string' ) {
            return namespace;
        }
        if ( namespace.startsWith('/') ) {
            namespace = namespace.substr(1);
        }
        if ( prefixNamespace ) {
            namespace = `${ prefixNamespace.replace(/\/$/, '') }/${ namespace }`;
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

        if ( this._instances.has(namespace) ) {
            return {
                type: 'binding',
                namespace: namespace
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
        if ( typeof namespace !== 'string' ) {
            return false;
        }
        return !! this.getAutoloadBaseNamespace(namespace);
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
    public getResolver(
        fallbackMethod?: string,
        rcNamespaceKey?: string,
        fallbackNamespace?: string,
    ): Resovler {
        return new Resovler(this, fallbackMethod, rcNamespaceKey, fallbackNamespace);
    }

    /**
     * Restore the fake
     */
    public restore(name: NameSapceType) {
        this._fakes.delete(name)
    }

    /**
     * Clear all of the instances from the container.
     *
     * @return void
     */
    public forgetInstances(): void {
        this._instances = new Map<any, any>();
    }

    /**
     * Drop all of the stale instances and aliases.
     *
     * @param  string  $abstract
     * @return void
     */
    protected dropStaleInstances(name: NameSapceType) {
        this._instances.delete(name);
    }
}
