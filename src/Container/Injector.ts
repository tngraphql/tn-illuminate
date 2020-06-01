/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/10/2020
 * Time: 2:38 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import 'reflect-metadata';
import { Container, NameSapceType } from './Container';
import { isClass, isPrimtiveConstructor } from '../utils';
import { InvalidInjectionException } from './InvalidInjectionException';
import { CreateProxyReference } from './ProxyReference';

/**
 * Type for what object is instances of
 */
export interface Type<T> {
    new(...args: any[]): T;
}

export class Injector {
    private services: Map<any, any> = new Map<unknown, unknown>();

    constructor(public app: Container) {
    }

    /**
     * Resolves instances by injecting required services
     * @param {Type<any>} target
     * @returns {T}
     */
    public injectDependencies<T = any>(target: Type<any> | any, binding = true, args: any = []): T {
        if ( ! isClass(target) || target.makePlain === true ) {
            return target
        }

        if ( this.services.has(target) ) {
            return this.services.get(target);
        }

        // tokens are required dependencies, while injections are resolved tokens from the Injector
        const tokens = Reflect.getMetadata('design:paramtypes', target) || [];
        const params = this.initializeParams(target, tokens);
        const injections = this.resolveInjections(target.name, params, args);

        if ( this.app.hasBinding(target) && binding ) {
            return this.app.use(target);
        }

        const value = new target(...injections);

        this.services.set(target, value);

        this.applyPropertyHandlers(target, value, args);
        return value;
    }

    public injectMethodDependencies(target, method, runtimeValues = []) {
        const constructor = target.constructor;

        const tokens = Reflect.getMetadata('design:paramtypes', target, method) || [];
        const params = this.initializeParams(target, tokens);

        return target[method](...this.resolveInjections(`${ constructor.name }.${ method }`, params, runtimeValues));
    }

    /**
     * Resolves the injections to be injected to a method or the
     * class constructor
     */
    private resolveInjections(targetName: string, injections: any[], runtimeValues: any[]): any[] {
        let resolveData = null;
        if (runtimeValues && !Array.isArray(runtimeValues)) {
            resolveData = runtimeValues;
            runtimeValues = [];
        }

        /**
         * If the runtime values length is greater or same as the length
         * of injections, then we treat them as the source of truth
         * and inject them as it is
         */
        if ( runtimeValues && runtimeValues.length >= injections.length ) {
            return runtimeValues;
        }

        /**
         * Loop over all the injections and give preference to runtime value
         * for a given index, otherwise fallback to `container.make`.
         */
        return injections.map((injection: any, index: number) => {
            if ( runtimeValues && runtimeValues[index] !== undefined ) {
                return runtimeValues[index]
            }

            if (typeof injection === 'object' && injection.kind === 'custom') {
                return injection.resolver(resolveData);
            }

            /**
             * Disallow object and primitive constructors
             */
            if ( isPrimtiveConstructor(injection) ) {
                throw InvalidInjectionException.invoke(injections[index], targetName, index);
            }

            if ( injection.forwardRef ) {
                return CreateProxyReference(injection.value, this.app);
            }

            return this.make<any>(injection, resolveData);
        })
    }

    private initializeParams(target: Function, paramTypes: any[]): any[] {
        return paramTypes.map((paramType, index) => {
            const paramHandler = Injector.handlers.find(handler => {
                if ( typeof target === 'object' && typeof handler.object === 'object' ) {
                    return handler.object === (target as any).constructor.prototype && handler.index === index;
                }
                return handler.object === target && handler.index === index;
            });

            if ( paramHandler ) {
                return paramHandler.value();
            }

            return paramType;
        });
    }

    /**
     * Applies all registered handlers on a given target class.
     */
    private applyPropertyHandlers(target: Function, instance: { [key: string]: any }, res) {
        Injector.handlers.forEach(handler => {
            if ( typeof handler.index === 'number' ) return;
            if ( handler.object.constructor !== target && ! (target.prototype instanceof handler.object.constructor) )
                return;

            const value = handler.value();

            if (typeof value === 'object' && value.kind === 'custom') {
                instance[handler.propertyName] = value.resolver(!Array.isArray(res) ? res : null);
            } else {
                instance[handler.propertyName] = this.make(value, res);
            }
        });
    }

    private make<T = any>(concrete: NameSapceType, resolveData): T {
        if ( typeof (concrete) !== 'string' && ! this.app.lookup(concrete) ) {
            return this.injectDependencies(concrete, true, resolveData);
        }
        return this.app.make(concrete, resolveData);
    }

    /**
     * All registered handlers.
     */
    static readonly handlers: any[] = [];

    /**
     * Registers a new handler.
     */
    static registerHandler(handler: any) {
        this.handlers.push(handler);
        return this;
    }
}
