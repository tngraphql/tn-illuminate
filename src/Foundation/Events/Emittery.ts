'use strict';

import { EventName } from '../../Contracts/Events/EmitterContract';
import { Event } from '../../Support/Facades';

/**
 Removes an event subscription.
 */
type UnsubscribeFn = () => void;

/**
 The data provided as `eventData` when listening for `Emittery.listenerAdded` or `Emittery.listenerRemoved`.
 */
interface ListenerChangedData {
    /**
     The listener that was added or removed.
     */
    listener: (eventData?: unknown) => void;

    /**
     The name of the event that was added or removed if `.on()` or `.off()` was used, or `undefined` if `.onAny()` or `.offAny()` was used.
     */
    eventName?: EventName;
}

const anyMap = new WeakMap();
const eventsMap = new WeakMap();
const producersMap = new WeakMap();
const anyProducer = Symbol('anyProducer');
const resolvedPromise = Promise.resolve();

const listenerAdded = Symbol('listenerAdded');
const listenerRemoved = Symbol('listenerRemoved');

function assertEventName(eventName) {
    if ( typeof eventName !== 'string' && typeof eventName !== 'symbol' && typeof eventName !== 'function' ) {
        throw new TypeError('eventName must be a string, symbol or a function');
    }
}

function assertListener(listener) {
    if ( typeof listener !== 'function' ) {
        throw new TypeError('listener must be a function');
    }
}

function getListeners(instance, eventName) {
    const events = eventsMap.get(instance);
    if ( ! events.has(eventName) ) {
        events.set(eventName, new Set());
    }

    return events.get(eventName);
}

function getEventProducers(instance, eventName?) {
    const key = typeof eventName === 'string' ? eventName : anyProducer;
    const producers = producersMap.get(instance);
    if ( ! producers.has(key) ) {
        producers.set(key, new Set());
    }

    return producers.get(key);
}

function enqueueProducers(instance, eventName, eventData) {
    const producers = producersMap.get(instance);
    if ( producers.has(eventName) ) {
        for( const producer of producers.get(eventName) ) {
            producer.enqueue(eventData);
        }
    }

    if ( producers.has(anyProducer) ) {
        const item = Promise.all([eventName, eventData]);
        for( const producer of producers.get(anyProducer) ) {
            producer.enqueue(item);
        }
    }
}

function iterator(instance, eventName?) {
    let isFinished = false;
    let flush = () => {
    };
    let queue = [];

    const producer = {
        enqueue(item) {
            queue.push(item);
            flush();
        },
        finish() {
            isFinished = true;
            flush();
        }
    };

    getEventProducers(instance, eventName).add(producer);

    return {
        async next() {
            if ( ! queue ) {
                return { done: true };
            }

            if ( queue.length === 0 ) {
                if ( isFinished ) {
                    queue = undefined;
                    return this.next();
                }

                await new Promise(resolve => {
                    flush = resolve;
                });

                return this.next();
            }

            return {
                done: false,
                value: await queue.shift()
            };
        },

        async return(value) {
            queue = undefined;
            getEventProducers(instance, eventName).delete(producer);
            flush();

            return arguments.length > 0 ?
                { done: true, value: await value } :
                { done: true };
        },

        [Symbol.asyncIterator]() {
            return this;
        }
    };
}

function defaultMethodNamesOrAssert(methodNames) {
    if ( methodNames === undefined ) {
        return allEmitteryMethods;
    }

    if ( ! Array.isArray(methodNames) ) {
        throw new TypeError('`methodNames` must be an array of strings');
    }

    for( const methodName of methodNames ) {
        if ( ! allEmitteryMethods.includes(methodName) ) {
            if ( typeof methodName !== 'string' ) {
                throw new TypeError('`methodNames` element must be a string');
            }

            throw new Error(`${ methodName } is not Emittery method`);
        }
    }

    return methodNames;
}

const isListenerSymbol = symbol => symbol === listenerAdded || symbol === listenerRemoved;

class Emittery {
    public static Typed: any;

    /**
     Fires when an event listener was added.
     An object with `listener` and `eventName` (if `on` or `off` was used) is provided as event data.
     @example
     ```
     import Emittery = require('emittery');
     const emitter = new Emittery();
     emitter.on(Emittery.listenerAdded, ({listener, eventName}) => {
		console.log(listener);
		//=> data => {}
		console.log(eventName);
		//=> '🦄'
	});
     emitter.on('🦄', data => {
		// Handle data
	});
     ```
     */
    public static readonly listenerAdded: unique symbol;

    /**
     Fires when an event listener was removed.
     An object with `listener` and `eventName` (if `on` or `off` was used) is provided as event data.
     @example
     ```
     import Emittery = require('emittery');
     const emitter = new Emittery();
     const off = emitter.on('🦄', data => {
		// Handle data
	});
     emitter.on(Emittery.listenerRemoved, ({listener, eventName}) => {
		console.log(listener);
		//=> data => {}
		console.log(eventName);
		//=> '🦄'
	});
     off();
     ```
     */
    public static readonly listenerRemoved: unique symbol;

    /**
     In TypeScript, it returns a decorator which mixins `Emittery` as property `emitteryPropertyName` and `methodNames`, or all `Emittery` methods if `methodNames` is not defined, into the target class.
     @example
     ```
     import Emittery = require('emittery');
     @Emittery.mixin('emittery')
     class MyClass {}
     const instance = new MyClass();
     instance.emit('event');
     ```
     */
    public static mixin(emitteryPropertyName: string, methodNames?: readonly string[]): Function {
        methodNames = defaultMethodNamesOrAssert(methodNames);
        return target => {
            if ( typeof target !== 'function' ) {
                throw new TypeError('`target` must be function');
            }

            for( const methodName of methodNames ) {
                if ( target.prototype[methodName] !== undefined ) {
                    throw new Error(`The property \`${ methodName }\` already exists on \`target\``);
                }
            }

            function getEmitteryProperty() {
                Object.defineProperty(this, emitteryPropertyName, {
                    enumerable: false,
                    value: new Emittery()
                });
                return this[emitteryPropertyName];
            }

            Object.defineProperty(target.prototype, emitteryPropertyName, {
                enumerable: false,
                get: getEmitteryProperty
            });

            const emitteryMethodCaller = methodName => function(...args) {
                return this[emitteryPropertyName][methodName](...args);
            };

            for( const methodName of methodNames ) {
                Object.defineProperty(target.prototype, methodName, {
                    enumerable: false,
                    value: emitteryMethodCaller(methodName)
                });
            }

            return target;
        };
    }

    constructor() {
        anyMap.set(this, new Set());
        eventsMap.set(this, new Map());
        producersMap.set(this, new Map());
    }

    /**
     Subscribe to an event.
     Using the same listener multiple times for the same event will result in only one method call per emitted event.
     @returns An unsubscribe method.
     */
    public on(eventName: typeof Emittery.listenerAdded | typeof Emittery.listenerRemoved, listener: (eventData: ListenerChangedData) => void): UnsubscribeFn
    public on(eventName: EventName, listener: (eventData?: unknown) => void): UnsubscribeFn;
    public on(eventName, listener) {
        assertEventName(eventName);
        assertListener(listener);
        getListeners(this, eventName).add(listener);

        if ( ! isListenerSymbol(eventName) ) {
            this.emit(listenerAdded, { eventName, listener });
        }

        return this.off.bind(this, eventName, listener);
    }

    /**
     Remove an event subscription.
     */
    public off(eventName: EventName, listener: (eventData?: unknown) => void): void {
        assertEventName(eventName);
        assertListener(listener);

        if ( ! isListenerSymbol(eventName) ) {
            this.emit(listenerRemoved, { eventName, listener });
        }

        getListeners(this, eventName).delete(listener);
    }

    /**
     Subscribe to an event only once. It will be unsubscribed after the first
     event.

     @returns The event data when `eventName` is emitted.
     */
    public once(eventName: typeof Emittery.listenerAdded | typeof Emittery.listenerRemoved): Promise<ListenerChangedData>
    public once(eventName: EventName): Promise<unknown> {
        return new Promise(resolve => {
            assertEventName(eventName);
            const off = this.on(eventName, data => {
                off();
                resolve(data);
            });
        });
    }

    /**
     Get an async iterator which buffers data each time an event is emitted.
     Call `return()` on the iterator to remove the subscription.
     @example
     ```
     import Emittery = require('emittery');
     const emitter = new Emittery();
     const iterator = emitter.events('🦄');
     emitter.emit('🦄', '🌈1'); // Buffered
     emitter.emit('🦄', '🌈2'); // Buffered
     iterator
     .next()
     .then(({value, done}) => {
			// done === false
			// value === '🌈1'
			return iterator.next();
		})
     .then(({value, done}) => {
			// done === false
			// value === '🌈2'
			// Revoke subscription
			return iterator.return();
		})
     .then(({done}) => {
			// done === true
		});
     ```
     In practice you would usually consume the events using the [for await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) statement. In that case, to revoke the subscription simply break the loop.
     @example
     ```
     import Emittery = require('emittery');
     const emitter = new Emittery();
     const iterator = emitter.events('🦄');
     emitter.emit('🦄', '🌈1'); // Buffered
     emitter.emit('🦄', '🌈2'); // Buffered
     // In an async context.
     for await (const data of iterator) {
		if (data === '🌈2') {
			break; // Revoke the subscription when we see the value `🌈2`.
		}
	}
     ```
     */
    public events(eventName: EventName): AsyncIterableIterator<unknown> {
        assertEventName(eventName);
        return iterator(this, eventName) as AsyncIterableIterator<unknown>;
    }

    /**
     Trigger an event asynchronously, optionally with some data. Listeners are called in the order they were added, but executed concurrently.

     @returns A promise that resolves when all the event listeners are done. *Done* meaning executed if synchronous or resolved when an async/promise-returning function. You usually wouldn't want to wait for this, but you could for example catch possible errors. If any of the listeners throw/reject, the returned promise will be rejected with the error, but the other listeners will not be affected.
     */
    async emit(eventName: EventName, eventData?: unknown): Promise<void> {
        assertEventName(eventName);

        enqueueProducers(this, eventName, eventData);

        const listeners = getListeners(this, eventName);
        const anyListeners = anyMap.get(this);
        const staticListeners = [...listeners];
        const staticAnyListeners = isListenerSymbol(eventName) ? [] : [...anyListeners];

        await resolvedPromise;
        await Promise.all([
            ...staticListeners.map(async listener => {
                if ( listeners.has(listener) ) {
                    return listener(eventData);
                }
            }),
            ...staticAnyListeners.map(async listener => {
                if ( anyListeners.has(listener) ) {
                    return listener(eventName, eventData);
                }
            })
        ]);
    }

    /**
     Same as `emit()`, but it waits for each listener to resolve before triggering the next one. This can be useful if your events depend on each other. Although ideally they should not. Prefer `emit()` whenever possible.

     If any of the listeners throw/reject, the returned promise will be rejected with the error and the remaining listeners will *not* be called.

     @returns A promise that resolves when all the event listeners are done.
     */
    async emitSerial(eventName: EventName, eventData?: unknown): Promise<void> {
        assertEventName(eventName);

        const listeners = getListeners(this, eventName);
        const anyListeners = anyMap.get(this);
        const staticListeners = [...listeners];
        const staticAnyListeners = [...anyListeners];

        await resolvedPromise;
        /* eslint-disable no-await-in-loop */
        for( const listener of staticListeners ) {
            if ( listeners.has(listener) ) {
                await listener(eventData);
            }
        }

        for( const listener of staticAnyListeners ) {
            if ( anyListeners.has(listener) ) {
                await listener(eventName, eventData);
            }
        }
        /* eslint-enable no-await-in-loop */
    }

    /**
     Subscribe to be notified about any event.

     @returns A method to unsubscribe.
     */
    public onAny(listener: (eventName: EventName, eventData?: unknown) => unknown): UnsubscribeFn {
        assertListener(listener);
        anyMap.get(this).add(listener);
        this.emit(listenerAdded, { listener });
        return this.offAny.bind(this, listener);
    }

    /**
     Get an async iterator which buffers a tuple of an event name and data each time an event is emitted.

     Call `return()` on the iterator to remove the subscription.

     In the same way as for `events`, you can subscribe by using the `for await` statement.

     @example
     ```
     import Emittery = require('emittery');

     const emitter = new Emittery();
     const iterator = emitter.anyEvent();

     emitter.emit('🦄', '🌈1'); // Buffered
     emitter.emit('🌟', '🌈2'); // Buffered

     iterator.next()
     .then(({value, done}) => {
			// done is false
			// value is ['🦄', '🌈1']
			return iterator.next();
		})
     .then(({value, done}) => {
			// done is false
			// value is ['🌟', '🌈2']
			// revoke subscription
			return iterator.return();
		})
     .then(({done}) => {
			// done is true
		});
     ```
     */
    public anyEvent(): AsyncIterableIterator<unknown> {
        return iterator(this) as any;
    }

    /**
     Remove an `onAny` subscription.
     */
    public offAny(listener: (eventName: EventName, eventData?: unknown) => void): void {
        assertListener(listener);
        this.emit(listenerRemoved, { listener });
        anyMap.get(this).delete(listener);
    }

    /**
     Clear all event listeners on the instance.

     If `eventName` is given, only the listeners for that event are cleared.
     */
    public clearListeners(eventName?: EventName): void {
        if ( typeof eventName === 'string' ) {
            getListeners(this, eventName).clear();

            const producers = getEventProducers(this, eventName);

            for( const producer of producers ) {
                producer.finish();
            }

            producers.clear();
        } else {
            anyMap.get(this).clear();

            for( const listeners of eventsMap.get(this).values() ) {
                listeners.clear();
            }

            for( const producers of producersMap.get(this).values() ) {
                for( const producer of producers ) {
                    producer.finish();
                }

                producers.clear();
            }
        }
    }

    /**
     The number of listeners for the `eventName` or all events if not specified.
     */
    public listenerCount(eventName?: EventName): number {
        if ( typeof eventName === 'string' ) {
            return anyMap.get(this).size + getListeners(this, eventName).size +
                getEventProducers(this, eventName).size + getEventProducers(this).size;
        }

        if ( typeof eventName !== 'undefined' ) {
            assertEventName(eventName);
        }

        let count = anyMap.get(this).size;

        for( const value of eventsMap.get(this).values() ) {
            count += value.size;
        }

        for( const value of producersMap.get(this).values() ) {
            count += value.size;
        }

        return count;
    }

    /**
     Bind the given `methodNames`, or all `Emittery` methods if `methodNames` is not defined, into the `target` object.

     @example
     ```
     import Emittery = require('emittery');

     const object = {};

     new Emittery().bindMethods(object);

     object.emit('event');
     ```
     */
    public bindMethods(target: object, methodNames?: readonly string[]): void {
        if ( typeof target !== 'object' || target === null ) {
            throw new TypeError('`target` must be an object');
        }

        methodNames = defaultMethodNamesOrAssert(methodNames);

        for( const methodName of methodNames ) {
            if ( target[methodName] !== undefined ) {
                throw new Error(`The property \`${ methodName }\` already exists on \`target\``);
            }

            Object.defineProperty(target, methodName, {
                enumerable: false,
                value: this[methodName].bind(this)
            });
        }
    }
}

const allEmitteryMethods = Object.getOwnPropertyNames(Emittery.prototype).filter(v => v !== 'constructor');

// Subclass used to encourage TS users to type their events.
Emittery.Typed = class extends Emittery {
};
Object.defineProperty(Emittery.Typed, 'Typed', {
    enumerable: false,
    value: undefined
});

Object.defineProperty(Emittery, 'listenerAdded', {
    value: listenerAdded,
    writable: false,
    enumerable: true,
    configurable: false
});
Object.defineProperty(Emittery, 'listenerRemoved', {
    value: listenerRemoved,
    writable: false,
    enumerable: true,
    configurable: false
});

export { Emittery };