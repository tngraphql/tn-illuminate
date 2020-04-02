/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/9/2020
 * Time: 9:27 PM
 */
import { Container } from '../Container/Container';
import { esmRequire, resolveFrom } from '@poppinss/utils/build';
import { ServiceProvider } from '../Support/ServiceProvider';
import * as path from 'path';
import { EventServiceProvider } from './Events/EventServiceProvider';
import { ServiceProviderContract } from '../Contracts/ServiceProviderContract';
import { RoutingServiceProvider } from './Routing/RoutingServiceProvider';
import { ProviderRepository } from './ProviderRepository';
import { Filesystem } from '@poppinss/dev-utils/build';
import { Env } from '../Support/Env';
import { ApplicationContract } from '../Contracts/ApplicationContract';
import { LogServiceProvider } from '../Log/LogServiceProvider';
import { ProfilerServiceProvider } from '../Profiler/ProfilerServiceProvider';
import { LocaleUpdated } from './Events/LocaleUpdated';
import { event } from '../Support/helpers';

export class Application extends Container implements ApplicationContract{
    [key: string]: any;

    public get inProduction() {
        return process.env.NODE_ENV === 'production';
    };

    protected _basePath: string = process.cwd();

    protected serviceProviders: any[] = [];

    protected _booted: boolean = false;

    protected _bootedCallbacks: any[] = [];

    protected _instances = new Map();

    constructor(basePath: string = null) {
        super();

        if ( basePath ) {
            this.setBasePath(basePath);
        }

        this.registerBaseBindings();
        this.registerBaseServiceProviders();
    }

    public setBasePath(basePath: string) {
        this._basePath = basePath;
    }

    public basePath(p: string = ''): string {
        return path.join(this._basePath, p);
    }

    public getBasePath() {
        return this._basePath;
    }

    public configPath() {
        return this._basePath + '/config';
    }

    public instance(name: string, instance: any) {
        this[name] = instance;
    }

    public getter(name, callback) {
        (this as any).constructor.getter(name, callback);
    }

    protected registerBaseBindings() {
        Container['setInstance'](this);

        this.bind(Container, () => this);
        this.bind(Application, () => this);
    }

    protected registerBaseServiceProviders() {
        try {
            this.register(new EventServiceProvider(this));
            this.register(new ProfilerServiceProvider(this));
            this.register(new LogServiceProvider(this));
            this.register(new RoutingServiceProvider(this));
        } catch (e) {
            throw e;
        }
    }

    public getServiceProviders() {
        return this.serviceProviders;
    }

    public async registerConfiguredProviders() {
        await new ProviderRepository(this as any, new Filesystem(this.basePath()), this.getCachedServicesPath()).load(this.config.get('app.providers', []));

        /*this.config.get('app.providers', []).map(async provider => {
            if ( typeof provider === 'string' ) {
                await this.register(this.resolveProvider(provider))
            } else {
                await this.register(new provider(this));
            }
        });*/
    }

    public async bootstrapWith(bootstrappers: any[]) {
        for await(const bootstrapper of bootstrappers ) {
            await this.make<any>(bootstrapper).bootstrap(this);
        }
    }

    /**
     * Register a service provider with the application.
     *
     * @param provider
     * @param force
     */
    public async register(provider: ServiceProviderContract | string, force: boolean = false) {

        if ( typeof provider === 'string' ) {
            provider = await this.resolveProvider(provider);
        }

        if ( typeof ((provider as any).register) === 'function' ) {
            await (provider as any).register();
        }

        if ( (provider as object).hasOwnProperty('bindings') ) {
            for( let item of provider['bindings'] ) {
                if ( ! Array.isArray(item) ) {
                    item = [item];
                }
                const [namespace, concrete] = item;
                this.bind(namespace, concrete || namespace);
            }
        }

        if ( (provider as object).hasOwnProperty('singletons') ) {
            for( let item of provider['singletons'] ) {
                if ( ! Array.isArray(item) ) {
                    item = [item];
                }
                const [namespace, concrete] = item;
                this.singleton(namespace, concrete || namespace);
            }
        }

        await this.markAsRegistered(provider);

        if ( this._booted ) {
            await this.bootProvider(provider);
        }

        return provider;
    }

    public markAsRegistered(provider: ServiceProviderContract) {
        this.serviceProviders.push(provider);
    }

    public async boot() {
        if ( this._booted ) {
            return;
        }

        this.serviceProviders.map(async provider => {
            await this.bootProvider(provider);
        });

        this._booted = true;

        await this.fireAppCallbacks(this._bootedCallbacks);
    }

    public async booted(callback: (app: this) => {}) {
        this._bootedCallbacks.push(callback);

        if ( this.isBooted() ) {
            await this.fireAppCallbacks([callback]);
        }
    }

    protected async fireAppCallbacks(callbacks: ((app: this) => {})[]) {
        for (let callback of callbacks) {
            await callback(this);
        }
    }

    public isBooted(): boolean {
        return this._booted;
    }

    public async bootProvider(provider: ServiceProviderContract) {
        if ( typeof (provider as any).boot === 'function' ) {
            await (provider as any).boot();
        }
    }

    public resolveProvider(providerPath: string): ServiceProvider {
        providerPath = this.basePath() ? resolveFrom(this.basePath(), providerPath) : providerPath
        let provider = esmRequire(providerPath);

        const name = path.basename(providerPath, path.extname(providerPath));

        if ( provider[name] ) {
            provider = provider[name] as any;
        }

        if ( typeof (provider) !== 'function' ) {
            throw new Error(`Make sure export default or export ${ path.basename(providerPath) } the provider from ${ providerPath }`)
        }

        return new provider(this);
    }

    public flush() {
        super.flush();

        this.serviceProviders = [];
        this._bootedCallbacks = [];
    }

    protected _environmentPath: string;
    protected _environmentFile: string = '.env';

    public environmentPath() {
        return this._environmentPath || process.cwd();
    }

    public useEnvironmentPath(path: string) {
        this._environmentPath = path;
        return this;
    }

    public loadEnvironmentFrom(file: string) {
        this._environmentFile = file;
    }

    public environmentFile() {
        return this._environmentFile || '.env'
    }

    public environmentFilePath() {
        return path.join(this.environmentPath(), this.environmentFile());
    }

    /**
     * Determine if the application is running unit tests.
     */
    public runningUnitTests(): boolean {
        return this['environment'] === 'test';
    }

    /**
     * Get the path to the cached services.php file.
     *
     * @return string
     */
    public getCachedServicesPath() {
        return this.normalizeCachePath('APP_SERVICES_CACHE', 'cache/services');
    }

    /**
     * Normalize a relative or absolute path to a cache file.
     *
     * @param  string  $key
     * @param  string  $default
     * @return string
     */
    protected normalizeCachePath(key, defaultValue) {
        let env = Env.get(key);
        if ( ! env ) {
            return this.bootstrapPath(defaultValue);
        }

        return env.startsWith('/') ? env : this.basePath(env);
    }

    public bootstrapPath(p = '') {
        return path.join(this.basePath(), 'bootstrap', p);
    }

    /**
     * Get the current application locale.
     *
     * @return string
     */
    public setLocale(locale) {
        this.config.set('i18n.defaultLocale', locale);
        this.translator.setLocale(locale);
        event(new LocaleUpdated(locale), this.events);
    }

    /**
     * Set the current application locale.
     *
     * @param  string  $locale
     * @return void
     */
    public getLocale(): string {
        return this.config.get('i18n.defaultLocale');
    }

    /**
     * Determine if application locale is the given locale.
     *
     * @param  string  $locale
     * @return bool
     */
    public isLocale(locale) {
        return this.getLocale() === locale;
    }
}
