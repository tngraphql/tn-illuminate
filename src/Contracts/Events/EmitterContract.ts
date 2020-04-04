/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/15/2020
 * Time: 7:40 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Shape of catch all events handler
 */
export type AnyHandler<T extends any = any> = ((event: string, data: T) => Promise<void> | void);

/**
 * The shape of emitter transport. This has to be same as
 * `emittery`.
 */
export interface EmitterTransportContract {
    events: any;

    on(event: string, handler: EventHandler): void;
    once(event: string): Promise<any>;
    onAny(handler: AnyHandler): void;
    emit(event: string, data: any): Promise<void>;
    off(event: string, handler: EventHandler): void;
    offAny(handler: AnyHandler): void;
    off(event: string, handler: EventHandler): void;
    clearListeners(event?: string): void;
    listenerCount(event?: string): number;
}

/**
 * Shape of event handler
 */
export type EventHandler<T extends any = any> = ((data: T) => Promise<void> | void);

/**
 * Shape of Event emitter
 */
export interface EmitterContract<T extends any = any> {
    transport: EmitterTransportContract;

    /**
     * Define a custom Ioc Container base namespace for resolving
     * the listener bindings.
     */
    namespace(namespace: string): this;

    /**
     * Listen for an event
     */
    on(event: string | symbol | Function, handler: EventHandler | string): this;

    /**
     * Listen for an event only once
     */
    once(event: string | symbol | Function, handler: EventHandler<T> | string): this;

    /**
     * Listen for all events
     */
    onAny(handler: AnyHandler): this;

    /**
     * Emit an event
     */
    emit(event: string | symbol | Function, data: T): Promise<void>;

    /**
     * Remove event listener
     */
    off(event: string | symbol | Function, handler: EventHandler | string): void;

    /**
     * Remove event listener listening for all events
     */
    offAny(handler: AnyHandler): void;

    /**
     * Clear a given listener for a given event
     */
    clearListener(event: string | symbol | Function, handler: EventHandler | string): void;

    /**
     * Clear all listeners for a given event
     */
    clearListeners(event?: string | symbol | Function): void;

    /**
     * Returns count of listeners listening for a given event
     */
    listenerCount(event?: string | symbol | Function): number;

    /**
     * Returns true when an event has one or more listeners
     */
    hasListeners(event?: string | symbol | Function): boolean;
}

/**
 Emittery accepts strings and symbols as event names.

 Symbol event names can be used to avoid name collisions when your classes are extended, especially for internal events.
 */
export type EventName = string | symbol | Function;

export interface FakeEmitterContract extends EmitterContract {
    events: any[]

    clear(): any;
}
