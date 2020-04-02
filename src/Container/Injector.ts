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
import { Container } from './Container';
import { isPrimtiveConstructor } from '../utils';
import { InvalidInjectionException } from './InvalidInjectionException';
import { OPTIONAL_DEPS_METADATA } from '../Decorators/Inject';

/**
 * Type for what object is instances of
 */
export interface Type<T> {
    new(...args: any[]): T;
}

export class Injector {
    constructor(public app: Container) {
    }

    /**
     * Resolves the injections to be injected to a method or the
     * class constructor
     */
    private resolveInjections (targetName: string, injections: any[], runtimeValues: any[]): any[] {
        /**
         * If the runtime values length is greater or same as the length
         * of injections, then we treat them as the source of truth
         * and inject them as it is
         */
        if (runtimeValues && runtimeValues.length >= injections.length) {
            return runtimeValues
        }

        /**
         * Loop over all the injections and give preference to runtime value
         * for a given index, otherwise fallback to `container.make`.
         */
        return injections.map((injection: any, index: number) => {
            if (runtimeValues && runtimeValues[index] !== undefined) {
                return runtimeValues[index]
            }

            /**
             * Disallow object and primitive constructors
             */
            if (isPrimtiveConstructor(injection)) {
                throw InvalidInjectionException.invoke(injections[index], targetName, index)
            }

            return this.app.make<any>(injection)
        })
    }

    /**
     * Resolves instances by injecting required services
     * @param {Type<any>} target
     * @returns {T}
     */
    injectDependencies<T>(target: Type<any>, binding = true, args: any = []): T {

        // tokens are required dependencies, while injections are resolved tokens from the Injector
        const tokens = Reflect.getMetadata('design:paramtypes', target) || [];
        const params = this.initializeParams(target, tokens);
        const injections = this.resolveInjections(target.name, params, args);

        if ( this.app.hasBinding(target) && binding) {
            return this.app.use(target);
        }

        const value = new target(...injections);

        this.applyPropertyHandlers(target, value);

        return value;
    }

    injectMethodDependencies(target, method, runtimeValues = []) {
        const constructor = target.constructor;

        const tokens = Reflect.getMetadata('design:paramtypes', target, method) || [];
        const params = this.initializeParams(target, tokens);

        return target[method](...this.resolveInjections(`${constructor.name}.${method}`, params, runtimeValues));
    }

    private initializeParams(target: Function, paramTypes: any[]): any[] {
        return paramTypes.map((paramType, index) => {
            const paramHandler = Injector.handlers.find(handler => {
                if ( typeof target === 'object' && typeof handler.object === 'object') {
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
    private applyPropertyHandlers(target: Function, instance: { [key: string]: any }) {
        Injector.handlers.forEach(handler => {
            if ( typeof handler.index === 'number' ) return;
            if ( handler.object.constructor !== target && ! (target.prototype instanceof handler.object.constructor) )
                return;

            instance[handler.propertyName] = this.app.make(handler.value());
        });
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