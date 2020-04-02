/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/16/2020
 * Time: 5:45 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import delay from 'delay';
import pEvent from 'p-event';
import { Emittery } from '../../src/Foundation/Events/Emittery';
import { buildExecutionContext } from 'graphql/execution/execute';

describe('Event | emittery', () => {
    test('on()', async () => {
        const emitter = new Emittery();
        const calls = [];
        const listener1 = () => calls.push(1);
        const listener2 = () => calls.push(2);
        emitter.on('🦄', listener1);
        emitter.on('🦄', listener2);
        await emitter.emit('🦄');
        expect(calls).toEqual([1, 2]);
    });

    test('on() - symbol eventName', async ()=> {
        const emitter = new Emittery();
        const eventName = Symbol('eventName');
        const calls = [];
        const listener1 = () => calls.push(1);
        const listener2 = () => calls.push(2);
        emitter.on(eventName, listener1);
        emitter.on(eventName, listener2);
        await emitter.emit(eventName);
        expect(calls).toEqual([1, 2]);
    });

    test('on() - listenerAdded', async () => {
        const emitter = new Emittery();
        const addListener = () => 1;
        setImmediate(() => emitter.on('abc', addListener));
        const {eventName, listener} = await pEvent(emitter, Emittery.listenerAdded, {
            rejectionEvents: []
        }) as any;
        expect(listener).toBe(addListener);
        expect(eventName).toBe(eventName);
    });

    test('on() - listenerRemoved', async () => {
        const emitter = new Emittery();
        const addListener = () => 1;
        emitter.on('abc', addListener);
        setImmediate(() => emitter.off('abc', addListener));
        const {eventName, listener} = await pEvent(emitter, Emittery.listenerRemoved, {
            rejectionEvents: []
        }) as any;
        expect(listener).toBe(addListener);
        expect(eventName).toBe('abc');
    });

    test('on() - listenerAdded onAny', async () => {
        const emitter = new Emittery();
        const addListener = () => 1;
        setImmediate(() => emitter.onAny(addListener));
        const {eventName, listener} = await pEvent(emitter, Emittery.listenerAdded, {
            rejectionEvents: []
        }) as any;
        expect(listener).toBe(addListener);
        expect(eventName).toBe(undefined);
    });

    it('off() - listenerAdded', (t) => {
        const emitter = new Emittery();
        const off = emitter.on(Emittery.listenerAdded, () => t.fail());
        off();
        emitter.emit('a');
        t();
    });

    test('on() - listenerAdded offAny', async () => {
        const emitter = new Emittery();
        const addListener = () => 1;
        emitter.onAny(addListener);
        setImmediate(() => emitter.offAny(addListener));
        const {listener, eventName} = await pEvent(emitter, Emittery.listenerRemoved) as any;
        expect(listener).toBe(addListener);
        expect(eventName).toBe(undefined);
    });

    test('on() - eventName must be a string or a symbol', () => {
        const emitter = new Emittery();

        emitter.on('string', () => {});
        emitter.on(Symbol('symbol'), () => {});

        try {
            (emitter as any).on(42, () => {});
        } catch (e) {
            expect(e).toBeInstanceOf(TypeError);
        }
    });

    test('on() - must have a listener', () => {
        const emitter = new Emittery();

        try {
            (emitter as any).on('🦄');
        } catch (e) {
            expect(e).toBeInstanceOf(TypeError);
        }
    });

    test('on() - returns a unsubcribe method', async () => {
        const emitter = new Emittery();
        const calls = [];
        const listener = () => calls.push(1);

        const off = emitter.on('🦄', listener);
        await emitter.emit('🦄');
        expect(calls).toEqual([1]);

        off();
        await emitter.emit('🦄');
        expect(calls).toEqual([1]);
    });

    test('on() - dedupes identical listeners', async () => {
        const emitter = new Emittery();
        const calls = [];
        const listener = () => calls.push(1);

        emitter.on('🦄', listener);
        emitter.on('🦄', listener);
        emitter.on('🦄', listener);
        await emitter.emit('🦄');
        expect(calls).toEqual([1]);
    });

    it('events()', async () => {
        const emitter = new Emittery();
        const iterator = emitter.events('🦄');

        await emitter.emit('🦄', '🌈');
        setTimeout(() => {
            emitter.emit('🦄', Promise.resolve('🌟'));
        }, 10);

        expect.assertions(3)
        const expected = ['🌈', '🌟'];
        for await (const data of iterator) {
            expect(data).toEqual(expected.shift());
            if (expected.length === 0) {
                break;
            }
        }

        expect(await iterator.next()).toEqual({ done: true});
    });

    test('events() - return() called during emit', async () => {
        const emitter = new Emittery();
        let iterator = null;
        emitter.on('🦄', () => {
            iterator.return();
        });
        iterator = emitter.events('🦄');
        emitter.emit('🦄', '🌈');
        expect(await iterator.next()).toEqual({done: false, value: '🌈'})
        expect(await iterator.next()).toEqual({done: true})
    });

    test('events() - return() awaits its argument', async () => {
        const emitter = new Emittery();
        const iterator = emitter.events('🦄');
        expect(await iterator.return(Promise.resolve(1))).toEqual({ done: true, value: 1 });
    });

    test('events() - return() without argument', async () => {
        const emitter = new Emittery();
        const iterator = emitter.events('🦄');
        expect(await iterator.return()).toEqual({ done: true });
    });

    test('events() - discarded iterators should stop receiving events', async () => {
        const emitter = new Emittery();
        const iterator = emitter.events('🦄');

        await emitter.emit('🦄', '🌈');
        expect(await iterator.next()).toEqual({ value: '🌈', done: false });
        await iterator.return();
        await emitter.emit('🦄', '🌈');
        expect(await iterator.next()).toEqual({done: true})

        setTimeout(() => {
            emitter.emit('🦄', '🌟');
        }, 10);

        await new Promise(resolve => setTimeout(resolve, 20));

        expect(await iterator.next()).toEqual({done: true})
    });

    test('off()', async () => {
        const emitter = new Emittery();
        const calls = [];
        const listener = () => calls.push(1);

        emitter.on('🦄', listener);
        await emitter.emit('🦄');
        expect(calls).toEqual([1]);

        emitter.off('🦄', listener);
        await emitter.emit('🦄');
        expect(calls).toEqual([1]);
    });

    test('off() - eventName must be a string or a symbol', () => {
        const emitter = new Emittery();

        emitter.on('string', () => {});
        emitter.on(Symbol('symbol'), () => {});

        try {
            (emitter as any).off(42);
        } catch (e) {
            expect(e).toBeInstanceOf(TypeError);
        }
    });

    test('off() - no listener', () => {
        const emitter = new Emittery();

        try {
            (emitter as any).off('🦄');
        } catch (e) {
            expect(e).toBeInstanceOf(TypeError)
        }
    });

    test('once()', async () => {
        const fixture = '🌈';
        const emitter = new Emittery();
        const promise = (emitter as any).once('🦄');
        emitter.emit('🦄', fixture);
        expect(await promise).toBe(fixture);
    });

    test('once() - eventName must be a string or a symbol', async (t) => {
        // expect.assertions(1);

        const emitter = new Emittery();

        (emitter as any).once('string');
        (emitter as any).once(Symbol('symbol'));

        try {
            await (emitter as any).once(42)
        } catch (e) {
            expect(e).toBeInstanceOf(TypeError);
            t()
        }
    });

    it('emit() - one event', () => {
        expect.assertions(1)

        const emitter = new Emittery();
        const eventFixture = {foo: true};

        emitter.on('🦄', data => {
            expect(data).toEqual(eventFixture);
        });

        emitter.emit('🦄', eventFixture);
    });

    it('emit() - multiple events', (t) => {
        expect.assertions(1);

        const emitter = new Emittery();
        let count = 0;

        emitter.on('🦄', async () => {
            await delay(Math.random() * 100);

            if (++count >= 5) {
                expect(count).toBe(5);
                t();
            }
        });

        emitter.emit('🦄');
        emitter.emit('🦄');
        emitter.emit('🦄');
        emitter.emit('🦄');
        emitter.emit('🦄');
    });

    test('emit() - eventName must be a string or a symbol', async () => {
        const emitter = new Emittery();

        emitter.emit('string');
        emitter.emit(Symbol('symbol'));

        try {
            await (emitter as any).emit(42)
        } catch (e) {
            expect(e).toBeInstanceOf(TypeError);
        }
    });

    it('emit() - is async', t => {
        expect.assertions(2);

        const emitter = new Emittery();
        let unicorn = false;

        emitter.on('🦄', () => {
            unicorn = true;
            expect(true).toBeTruthy();
            t();
        });

        emitter.emit('🦄');
        expect(unicorn).toBeFalsy();
    });

    test('emit() - calls listeners subscribed when emit() was invoked', async () => {
        const emitter = new Emittery();
        const calls = [];
        const off1 = emitter.on('🦄', () => calls.push(1));
        const p = emitter.emit('🦄');
        emitter.on('🦄', () => calls.push(2));
        await p;

        expect(calls).toEqual([1]);

        const off3 = emitter.on('🦄', () => {
            calls.push(3);
            off1();
            emitter.on('🦄', () => calls.push(4));
        });
        await emitter.emit('🦄');
        expect(calls).toEqual([1, 1, 2, 3]);
        off3();

        const off5 = emitter.on('🦄', () => {
            calls.push(5);
            emitter.onAny(() => calls.push(6));
        });
        await emitter.emit('🦄');
        expect(calls).toEqual([1, 1, 2, 3, 2, 4, 5]);
        off5();

        let off8 = null;
        emitter.on('🦄', () => {
            calls.push(7);
            off8();
        });
        off8 = emitter.on('🦄', () => calls.push(8));
        await emitter.emit('🦄');
        expect(calls).toEqual([1, 1, 2, 3, 2, 4, 5, 2, 4, 7, 6]);

        let off10 = null;
        emitter.onAny(() => {
            calls.push(9);
            off10();
        });
        off10 = emitter.onAny(() => calls.push(10));
        await emitter.emit('🦄');
        expect(calls).toEqual([1, 1, 2, 3, 2, 4, 5, 2, 4, 7, 6, 2, 4, 7, 6, 9]);

        await emitter.emit('🦄');
        expect(calls).toEqual([1, 1, 2, 3, 2, 4, 5, 2, 4, 7, 6, 2, 4, 7, 6, 9, 2, 4, 7, 6, 9])

        const p2 = emitter.emit('🦄');
        emitter.clearListeners();
        await p2;
        expect(calls).toEqual([1, 1, 2, 3, 2, 4, 5, 2, 4, 7, 6, 2, 4, 7, 6, 9, 2, 4, 7, 6, 9])
    });

    test('emitSerial()', t => {
        expect.assertions(1);

        const emitter = new Emittery();
        const events = [];

        const listener = async data => {
            await delay(Math.random() * 100);
            events.push(data);

            if (events.length >= 5) {
                expect(events).toEqual([1, 2, 3, 4, 5]);
                t();
            }
        };

        emitter.on('🦄', () => listener(1));
        emitter.on('🦄', () => listener(2));
        emitter.on('🦄', () => listener(3));
        emitter.on('🦄', () => listener(4));
        emitter.on('🦄', () => listener(5));

        emitter.emitSerial('🦄', 'e');
    });

    test('emitSerial() - eventName must be a string or a symbol', async () => {
        const emitter = new Emittery();

        emitter.emitSerial('string');
        emitter.emitSerial(Symbol('symbol'));

        try {
            await (emitter as any).emitSerial(42);
        } catch (e) {
            expect(e).toBeInstanceOf(TypeError);
        }
    });

    test('emitSerial() - is async', t => {
        expect.assertions(2)

        const emitter = new Emittery();
        let unicorn = false;

        emitter.on('🦄', () => {
            unicorn = true;
            expect(true).toBe(true);
            t();
        });

        emitter.emitSerial('🦄');

        expect(unicorn).toBe(false);
    });

    test('emitSerial() - calls listeners subscribed when emitSerial() was invoked', async () => {
        const emitter = new Emittery();
        const calls = [];
        const off1 = emitter.on('🦄', () => calls.push(1));
        const p = emitter.emitSerial('🦄');
        emitter.on('🦄', () => calls.push(2));
        await p;
        expect(calls).toEqual([1]);

        const off3 = emitter.on('🦄', () => {
            calls.push(3);
            off1();
            emitter.on('🦄', () => calls.push(4));
        });
        await emitter.emitSerial('🦄');
        expect(calls).toEqual([1, 1, 2, 3]);
        off3();

        const off5 = emitter.on('🦄', () => {
            calls.push(5);
            emitter.onAny(() => calls.push(6));
        });
        await emitter.emitSerial('🦄');
        expect(calls).toEqual([1, 1, 2, 3, 2, 4, 5]);
        off5();

        let off8 = null;
        emitter.on('🦄', () => {
            calls.push(7);
            off8();
        });
        off8 = emitter.on('🦄', () => calls.push(8));
        await emitter.emitSerial('🦄');
        expect(calls).toEqual([1, 1, 2, 3, 2, 4, 5, 2, 4, 7, 6]);

        let off10 = null;
        emitter.onAny(() => {
            calls.push(9);
            off10();
        });
        off10 = emitter.onAny(() => calls.push(10));
        await emitter.emitSerial('🦄');
        expect(calls).toEqual([1, 1, 2, 3, 2, 4, 5, 2, 4, 7, 6, 2, 4, 7, 6, 9]);

        await emitter.emitSerial('🦄');
        expect(calls).toEqual([1, 1, 2, 3, 2, 4, 5, 2, 4, 7, 6, 2, 4, 7, 6, 9, 2, 4, 7, 6, 9]);

        const p2 = emitter.emitSerial('🦄');
        emitter.clearListeners();
        await p2;
        expect(calls).toEqual([1, 1, 2, 3, 2, 4, 5, 2, 4, 7, 6, 2, 4, 7, 6, 9, 2, 4, 7, 6, 9]);
    });

    test('onAny()', async () => {
        expect.assertions(4);

        const emitter = new Emittery();
        const eventFixture = {foo: true};

        emitter.onAny((eventName, data) => {
            expect(eventName).toBe('🦄')
            expect(data).toEqual(eventFixture);
        });

        await emitter.emit('🦄', eventFixture);
        await emitter.emitSerial('🦄', eventFixture);
    });

    test('onAny() - must have a listener', () => {
        const emitter = new Emittery();

        try {
            (emitter as any).onAny();
        } catch (e) {
            expect(e).toBeInstanceOf(TypeError);
        }
    });

    test('anyEvent()', async () => {
        const emitter = new Emittery();
        const iterator = emitter.anyEvent();

        await emitter.emit('🦄', '🌈');
        setTimeout(() => {
            emitter.emit('🦄', Promise.resolve('🌟'));
        }, 10);

        expect.assertions(3)
        const expected = [['🦄', '🌈'], ['🦄', '🌟']];
        for await (const data of iterator) {
            expect(data).toEqual(expected.shift());
            if (expected.length === 0) {
                break;
            }
        }

        expect(await iterator.next()).toEqual({ done: true });
    });

    test('anyEvent() - return() called during emit', async () => {
        const emitter = new Emittery();
        let iterator = null;
        emitter.onAny(() => {
            iterator.return();
        });
        iterator = emitter.anyEvent();
        emitter.emit('🦄', '🌈');
        expect(await iterator.next()).toEqual({done: false, value: ['🦄', '🌈']})
        expect(await iterator.next()).toEqual({done: true})
    });

    test('anyEvents() - discarded iterators should stop receiving events', async () => {
        const emitter = new Emittery();
        const iterator = emitter.anyEvent();

        await emitter.emit('🦄', '🌈');
        expect(await iterator.next()).toEqual({ value: ['🦄', '🌈'], done: false });

        await iterator.return();
        await emitter.emit('🦄', '🌈');
        expect(await iterator.next()).toEqual({ done: true });

        setTimeout(() => {
            emitter.emit('🦄', '🌟');
        }, 10);

        await new Promise(resolve => setTimeout(resolve, 20));

        expect(await iterator.next()).toEqual({ done: true });
    });

    test('offAny()', async () => {
        const emitter = new Emittery();
        const calls = [];
        const listener = () => calls.push(1);
        emitter.onAny(listener);
        await emitter.emit('🦄');
        expect(calls).toEqual([1]);
        emitter.offAny(listener);
        await emitter.emit('🦄');
        expect(calls).toEqual([1]);
    });

    test('offAny() - no listener', () => {
        const emitter = new Emittery();

        expect(() => {
            (emitter as any).offAny();
        }).toThrow(TypeError);
    });

    test('clearListeners()', async () => {
        const emitter = new Emittery();
        const calls = [];
        emitter.on('🦄', () => calls.push('🦄1'));
        emitter.on('🌈', () => calls.push('🌈'));
        emitter.on('🦄', () => calls.push('🦄2'));
        emitter.onAny(() => calls.push('any1'));
        emitter.onAny(() => calls.push('any2'));
        await emitter.emit('🦄');
        await emitter.emit('🌈');
        expect(calls).toEqual(['🦄1', '🦄2', 'any1', 'any2', '🌈', 'any1', 'any2']);
        emitter.clearListeners();
        await emitter.emit('🦄');
        await emitter.emit('🌈');
        expect(calls).toEqual(['🦄1', '🦄2', 'any1', 'any2', '🌈', 'any1', 'any2']);
    });

    test('clearListeners() - also clears iterators', async () => {
        const emitter = new Emittery();
        const iterator = emitter.events('🦄');
        const anyIterator = emitter.anyEvent();
        await emitter.emit('🦄', '🌟');
        await emitter.emit('🌈', '🌟');

        expect(await iterator.next()).toEqual({done: false, value: '🌟'});
        expect(await anyIterator.next()).toEqual({done: false, value:  ['🦄', '🌟']});
        expect(await anyIterator.next()).toEqual({done: false, value:  ['🌈', '🌟']});

        await emitter.emit('🦄', '💫');
        emitter.clearListeners();
        await emitter.emit('🌈', '💫');
        expect(await iterator.next()).toEqual( {done: false, value: '💫'});
        expect(await iterator.next()).toEqual( {done: true});
        expect(await anyIterator.next()).toEqual({done: false, value: ['🦄', '💫']});
        expect(await anyIterator.next()).toEqual( {done: true});
    });

    test('clearListeners() - with event name', async () => {
        const emitter = new Emittery();
        const calls = [];
        emitter.on('🦄', () => calls.push('🦄1'));
        emitter.on('🌈', () => calls.push('🌈'));
        emitter.on('🦄', () => calls.push('🦄2'));
        emitter.onAny(() => calls.push('any1'));
        emitter.onAny(() => calls.push('any2'));
        await emitter.emit('🦄');
        await emitter.emit('🌈');
        expect(calls).toEqual(['🦄1', '🦄2', 'any1', 'any2', '🌈', 'any1', 'any2']);
        emitter.clearListeners('🦄');
        await emitter.emit('🦄');
        await emitter.emit('🌈');
        expect(calls).toEqual(['🦄1', '🦄2', 'any1', 'any2', '🌈', 'any1', 'any2', 'any1', 'any2', '🌈', 'any1', 'any2']);
    });

    test('clearListeners() - with event name - clears iterators for that event', async () => {
        const emitter = new Emittery();
        const iterator = emitter.events('🦄');
        const anyIterator = emitter.anyEvent();
        await emitter.emit('🦄', '🌟');
        await emitter.emit('🌈', '🌟');
        expect(await iterator.next()).toEqual({done: false, value: '🌟'});
        expect(await anyIterator.next()).toEqual({done: false, value:  ['🦄', '🌟']});
        expect(await anyIterator.next()).toEqual({done: false, value:  ['🌈', '🌟']});

        await emitter.emit('🦄', '💫');
        emitter.clearListeners('🦄');
        await emitter.emit('🌈', '💫');

        expect(await iterator.next()).toEqual( {done: false, value: '💫'});
        expect(await iterator.next()).toEqual( {done: true});
        expect(await anyIterator.next()).toEqual({done: false, value: ['🦄', '💫']});
        expect(await anyIterator.next()).toEqual( {done: false, value: ['🌈', '💫']});
    });

    test('listenerCount()', () => {
        const emitter = new Emittery();
        emitter.on('🦄', () => {});
        emitter.on('🌈', () => {});
        emitter.on('🦄', () => {});
        emitter.onAny(() => {});
        emitter.onAny(() => {});
        expect(emitter.listenerCount('🦄')).toBe(4);
        expect(emitter.listenerCount('🌈')).toBe(3);
        expect(emitter.listenerCount()).toBe(5);
    });

    test('listenerCount() - works with empty eventName strings', () => {
        const emitter = new Emittery();
        emitter.on('', () => {});
        expect(emitter.listenerCount('')).toBe(1);
    });

    test('listenerCount() - eventName must be undefined if not a string nor a symbol', () => {
        const emitter = new Emittery();

        emitter.listenerCount('string');
        emitter.listenerCount(Symbol('symbol'));
        emitter.listenerCount();

        expect(() => {
            (emitter as any).listenerCount(42);
        }).toThrow(TypeError)
    });

    test('bindMethods()', () => {
        const methodsToBind = ['on', 'off', 'emit', 'listenerCount'];

        const emitter = new Emittery();
        const target = {};

        const oldPropertyNames = Object.getOwnPropertyNames(target);
        emitter.bindMethods(target, methodsToBind);

        expect(Object.getOwnPropertyNames(target).sort()).toEqual(oldPropertyNames.concat(methodsToBind).sort());

        for (const method of methodsToBind) {
            expect(typeof target[method]).toBe('function');
        }

        expect((target as any).listenerCount()).toBe(0);
    });

    test('bindMethods() - methodNames must be array of strings or undefined', () => {
        expect(() => {
            new Emittery().bindMethods({}, null);
        }).toThrow();

        expect(() => {
            new Emittery().bindMethods({}, 'string' as any);
        }).toThrow();

        expect(() => {
            new Emittery().bindMethods({}, {} as any);
        }).toThrow();

        expect(() => {
            new Emittery().bindMethods({}, [null]);
        }).toThrow();

        expect(() => {
            new Emittery().bindMethods({}, [1] as any);
        }).toThrow();

        expect(() => {
            new Emittery().bindMethods({}, [{}] as any);
        }).toThrow();
    });

    test('bindMethods() - must bind all methods if no array supplied', () => {
        const methodsExpected = ['on', 'off', 'once', 'events', 'emit', 'emitSerial', 'onAny', 'anyEvent', 'offAny', 'clearListeners', 'listenerCount', 'bindMethods'];

        const emitter = new Emittery();
        const target = {};

        const oldPropertyNames = Object.getOwnPropertyNames(target);
        emitter.bindMethods(target);

        expect(Object.getOwnPropertyNames(target).sort()).toEqual(oldPropertyNames.concat(methodsExpected).sort());

        for (const method of methodsExpected) {
            expect(typeof target[method]).toBe('function');
        }

        expect((target as any).listenerCount()).toBe(0);
    });

    test('bindMethods() - methodNames must only include Emittery methods', () => {
        const emitter = new Emittery();
        const target = {};
        expect(() => emitter.bindMethods(target, ['noexistent'])).toThrow();
    });

    test('bindMethods() - must not set already existing fields', () => {
        const emitter = new Emittery();
        const target = {
            on: true
        };
        expect(() => emitter.bindMethods(target, ['on'])).toThrow();
    });

    test('bindMethods() - target must be an object', () => {
        const emitter = new Emittery();
        expect(() => emitter.bindMethods('string' as any, [])).toThrow();
        expect(() => emitter.bindMethods(null, [])).toThrow();
        expect(() => emitter.bindMethods(undefined, [])).toThrow();
    });

    test('mixin()', () => {
        class TestClass {

            constructor(public v) {
            }
        }

        const TestClassWithMixin = Emittery.mixin('emitter', ['on', 'off', 'once', 'emit', 'emitSerial', 'onAny', 'offAny', 'clearListeners', 'listenerCount', 'bindMethods'])(TestClass);
        const symbol = Symbol('test symbol');
        const instance = new TestClassWithMixin(symbol)
        expect(instance.emitter instanceof Emittery).toBeTruthy();
        expect(instance instanceof TestClass).toBeTruthy();
        expect(instance.emitter).toBe(instance.emitter);
        expect(instance.v).toBe(symbol);
        expect(instance.listenerCount()).toBe(0);
    });

    test('mixin() - methodNames must be array of strings or undefined', () => {
        class TestClass {}

        expect(() => Emittery.mixin('emitter', null)(TestClass)).toThrow();
        expect(() => Emittery.mixin('emitter', 'string' as any)(TestClass)).toThrow();
        expect(() => Emittery.mixin('emitter', {} as any)(TestClass)).toThrow();
        expect(() => Emittery.mixin('emitter', [null])(TestClass)).toThrow();
        expect(() => Emittery.mixin('emitter', [1] as any)(TestClass)).toThrow();
        expect(() => Emittery.mixin('emitter', [{}] as any)(TestClass)).toThrow();
    });

    test('mixin() - must mixin all methods if no array supplied', () => {
        const methodsExpected = ['on', 'off', 'once', 'events', 'emit', 'emitSerial', 'onAny', 'anyEvent', 'offAny', 'clearListeners', 'listenerCount', 'bindMethods'];

        class TestClass {}

        const TestClassWithMixin = Emittery.mixin('emitter')(TestClass);

        expect(Object.getOwnPropertyNames(TestClassWithMixin.prototype).sort()).toEqual(methodsExpected.concat(['constructor', 'emitter']).sort());
    });

    test('mixin() - methodNames must only include Emittery methods', () => {
        class TestClass {}

        expect(() => Emittery.mixin('emitter', ['nonexistent'])(TestClass)).toThrow();
    });

    test('mixin() - must not set already existing methods', () => {
        class TestClass {
            on() {
                return true;
            }
        }

        expect(() => Emittery.mixin('emitter', ['on'])(TestClass)).toThrow();
    });

    test('mixin() - target must be function', () => {
        expect(() => Emittery.mixin('emitter')('string')).toThrow(TypeError);
        expect(() => Emittery.mixin('emitter')(null)).toThrow();
        expect(() => Emittery.mixin('emitter')(undefined)).toThrow();
        expect(() => Emittery.mixin('emitter')({})).toThrow();
    });
});