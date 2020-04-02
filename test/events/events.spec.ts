/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/15/2020
 * Time: 8:22 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import {Application, GraphQLKernel} from '../../src/Foundation';
import { event } from '../../src/Support/helpers';
import {EventServiceProvider} from "../../src/Support/EventServiceProvider";

describe('Events', () => {
    describe('Events | Event', () => {
        let Event;
        beforeEach(async () => {
            jest.clearAllMocks()
            jest.clearAllTimers();
            jest.resetAllMocks();
            jest.resetModules()
            jest.resetModuleRegistry()
            const app = new Application(__dirname);
            Event = app.use('events');
        });

        it('listen for an event', async () => {
            expect.assertions(2);

            Event.on('new:user', (data) => {
                expect(data).toEqual({ id: 1 });
            })

            await Promise.all([
                Event.emit('new:user', { id: 1 }),
                Event.emit('new:user', { id: 1 }),
            ]);
        });

        it('listen for an event only once', async () => {
            expect.assertions(1)

            Event.once('new:user', (data) => {
                expect(data).toEqual({ id: 1 });
            })

            await Promise.all([
                Event.emit('new:user', { id: 1 }),
                Event.emit('new:user', { id: 1 }),
            ])
        });

        it('listen for any Events', async () => {
            expect.assertions(5)

            Event.once('new:user', (data) => {
                expect(data).toEqual({ id: 1 })
            })

            Event.onAny((name, data) => {
                expect(name).toBe('new:user')
                expect(data).toEqual({ id: 1 })
            })

            await Promise.all([
                Event.emit('new:user', { id: 1 }),
                Event.emit('new:user', { id: 1 }),
            ])
        });

        it('remove Event listener', async () => {
            expect.assertions(1)


            function listener (data) {
                Event.off('new:user', listener)
                expect(data).toEqual( { id: 1 })
            }

            Event.on('new:user', listener)

            await Promise.all([
                Event.emit('new:user', { id: 1 }),
                Event.emit('new:user', { id: 1 }),
            ])
        })

        it('remove all Event listeners for a given Event', async () => {
            expect.assertions(1)


            Event.once('new:user', (data) => {
                Event.clearListeners('new:user')
                expect(data).toEqual({ id: 1 })
            })

            await Promise.all([
                Event.emit('new:user', { id: 1 }),
                Event.emit('new:user', { id: 1 }),
            ])
        })

        it('remove listeners for all Events', async () => {
            expect.assertions(3)


            Event.once('new:user', (data) => {
                Event.clearListeners()
                expect(data).toEqual({ id: 1 })
            })

            Event.onAny((name, data) => {
                expect(name).toEqual('new:user')
                expect(data).toEqual({ id: 1 })
            })

            await Event.emit('new:user', { id: 1 })
            await Event.emit('new:account', { id: 1 })
        })

        it('get listener counts', async () => {
            Event.onAny(() => {
            })

            Event.on('new:user', () => {
            })

            Event.on('new:account', () => {
            })

            expect(Event.listenerCount('new:user')).toBe(2)
            expect(Event.listenerCount('new:account')).toBe(2)
            expect(Event.listenerCount()).toBe(3)
        })

        it('remove any listener', async () => {
            expect.assertions(6);
            function anyListener () {}
            Event.onAny(anyListener)

            Event.on('new:user', () => {
            })

            Event.on('new:account', () => {
            })

            expect(Event.listenerCount('new:user')).toBe(2)
            expect(Event.listenerCount('new:account')).toBe(2)
            expect(Event.listenerCount()).toBe(3)

            Event.offAny(anyListener)
            expect(Event.listenerCount('new:user')).toBe(1)
            expect(Event.listenerCount('new:account')).toBe(1)
            expect(Event.listenerCount()).toBe(2)
        })

        it('emit via typed emitter', async () => {
            expect.assertions(2)

            Event.on('new:user', (data) => {
                expect(data).toEqual({ id: 1 })
            })

            await Event.emit('new:user', { id: 1 })
            expect(Event.listenerCount()).toBe(1)
        })

        it('listen typed Events', async () => {
            expect.assertions(2)

            Event.on('new:user', (data) => {
                expect(data).toEqual({ id: 1 })
            })

            await Event.emit('new:user', { id: 1 })
            expect(Event.listenerCount()).toBe(1)
        })
    });

    describe('Emitter IoC reference', () => {
        let Event;
        let app;
        beforeEach(async () => {
            jest.clearAllMocks()
            jest.clearAllTimers();
            jest.resetAllMocks();
            jest.resetModules()
            jest.resetModuleRegistry()
            app = new Application(__dirname);
            Event = app.use('events');
        });

        it('define string based Event listener', async () => {
            expect.assertions(3)
            class MyListeners {
                public newUser (data) {
                    expect(data).toEqual({id: 1})
                }
            }

            app.bind('App/Listeners/MyListeners', () => {
                return new MyListeners()
            })

            Event.on('new:user', 'MyListeners.newUser')
            await Event.emit('new:user', { id: 1 })
            expect(Event['iocResolver']['eventHandlers'].get('new:user')!.size).toBe(1);
            expect(Event.listenerCount()).toBe(1);
        })

        it('remove string based Event listener', async () => {
            expect.assertions(3)
            class MyListeners {
                public newUser (data) {
                    expect(data).toEqual({id: 1})

                    /**
                     * Make sure multiple off calls is a noop
                     */
                    Event.off('new:user', 'MyListeners.newUser')
                    Event.off('new:user', 'MyListeners.newUser')
                    Event.off('new:user', 'MyListeners.newUser')
                }
            }

            app.bind('App/Listeners/MyListeners', () => {
                return new MyListeners()
            })

            Event.on('new:user', 'MyListeners.newUser')
            await Event.emit('new:user', { id: 1 })
            await Event.emit('new:user', { id: 1 })

            expect(Event['iocResolver']['eventHandlers'].get('new:user')!.size).toBe(0);
            expect(Event.listenerCount()).toBe(0);
        })

        it('multiple same Event listeners must result in a noop', async () => {
            expect.assertions(3)
            class MyListeners {
                public newUser (data) {
                    expect(data).toEqual({id: 1})
                }
            }

            app.bind('App/Listeners/MyListeners', () => {
                return new MyListeners()
            })

            Event.on('new:user', 'MyListeners.newUser')
            Event.on('new:user', 'MyListeners.newUser')
            Event.on('new:user', 'MyListeners.newUser')
            await Event.emit('new:user', { id: 1 })


            expect(Event['iocResolver']['eventHandlers'].get('new:user')!.size).toBe(1);
            expect(Event.listenerCount()).toBe(1);
        })

        it('define string based one time Event listener', async () => {
            expect.assertions(3)

            class MyListeners {
                public newUser (data) {
                    expect(data).toEqual({id: 1})
                }
            }

            app.bind('App/Listeners/MyListeners', () => {
                return new MyListeners()
            })

            Event.once('new:user', 'MyListeners.newUser')
            await Event.emit('new:user', { id: 1 })

            expect(Event['iocResolver']['eventHandlers'].get('new:user')!.size).toBe(0);
            expect(Event.listenerCount()).toBe(0);
        })

        it('define string based wildcard Event listener', async () => {
            expect.assertions(4)

            class MyListeners {
                public newUser (Event: string, data: any) {
                    expect(Event).toBe('new:user')
                    expect(data).toEqual({id: 1})
                }
            }

            app.bind('App/Listeners/MyListeners', () => {
                return new MyListeners()
            })

            Event.onAny('MyListeners.newUser')
            await Event.emit('new:user', { id: 1 })

            expect(Event['iocResolver']['anyHandlers'].size).toBe(1);
            expect(Event.listenerCount()).toBe(1);
        })

        it('multiple string based wildcard Event listeners must result in a noop', async () => {
            expect.assertions(4)

            class MyListeners {
                public newUser (Event: string, data: any) {
                    expect(Event).toBe('new:user');
                    expect(data).toEqual({id: 1});
                }
            }

            app.bind('App/Listeners/MyListeners', () => {
                return new MyListeners()
            })

            Event.onAny('MyListeners.newUser')
            Event.onAny('MyListeners.newUser')
            Event.onAny('MyListeners.newUser')

            await Event.emit('new:user', { id: 1 })

            expect(Event['iocResolver']['anyHandlers'].size).toBe(1);
            expect(Event.listenerCount()).toBe(1);
        })

        it('remove string based wildcard Event listener', async () => {
            expect.assertions(4)

            class MyListeners {
                public newUser (EventName: string, data: any) {
                    expect(EventName).toBe('new:user')
                    expect(data).toEqual({id: 1})
                    Event.offAny('MyListeners.newUser')
                }
            }


            app.bind('App/Listeners/MyListeners', () => {
                return new MyListeners()
            })

            Event.onAny('MyListeners.newUser')
            await Event.emit('new:user', { id: 1 })
            await Event.emit('new:user', { id: 1 })
            await Event.emit('new:user', { id: 1 })

            expect(Event['iocResolver']['anyHandlers'].size).toBe(0);
            expect(Event.listenerCount()).toBe(0);
        })

        it('define string based typed Event listener', async () => {
            expect.assertions(3)

            class MyListeners {
                public newUser (data: any) {
                    expect(data).toEqual({id: 1})
                }
            }

            app.bind('App/Listeners/MyListeners', () => {
                return new MyListeners()
            })

            Event.on('new:user', 'MyListeners.newUser')
            Event.emit('new:user', { id: 1 })

            expect(Event['iocResolver']['eventHandlers'].get('new:user')!.size).toBe(1);
            expect(Event.listenerCount()).toBe(1);
        })
    });

    describe('Emitter Funtion', () => {
        let Event;
        beforeEach(async () => {
            const app = new Application(__dirname);
            Event = app.use('events');
        });

        it('listen for an event', async () => {
            expect.assertions(2);

            class UserCreated {
                constructor(public user: any) {
                }
            }

            Event.on(UserCreated, (data) => {
                expect(data).toEqual(new UserCreated({id: 1}));
            })

            await Promise.all([
                Event.emit(UserCreated, new UserCreated({id: 1})),
                Event.emit(UserCreated, new UserCreated({id: 1})),
            ]);
        });

        it('Dispatching an event', async () => {
            expect.assertions(2);

            class UserCreated {
                constructor(public user: any) {
                }
            }

            Event.on(UserCreated, (data) => {
                expect(data).toEqual(new UserCreated({id: 1}));
            })

            await Promise.all([
                event(new UserCreated({id: 1}), Event),
                event(new UserCreated({id: 1}), Event)
            ]);
        });

    });

    describe('Register listen', () => {
        it('register listen', async () => {
            expect.assertions(1);

            const app = new Application(__dirname);
            const Event = app.use<any>('events');
            const kernel = new GraphQLKernel(app);
            await kernel.handle();

            class UserCreated {
                constructor(public user: any) {
                }
            }

            class SendMailUserCreated {
                handle(user: UserCreated) {
                    expect(user).toEqual(new UserCreated({id: 1}));
                }
            }

            class EventService extends EventServiceProvider {
                protected listen = [
                    {
                        event: UserCreated,
                        handlers: [
                            SendMailUserCreated
                        ]
                    }
                ]
            }

            await app.register(new EventService(app));

            Event.emit(UserCreated, new UserCreated({id: 1}))
        });

        it('register listen using injector', async () => {
            expect.assertions(2);

            const app = new Application(__dirname);
            const Event = app.use<any>('events');
            const kernel = new GraphQLKernel(app);
            await kernel.handle();

            class UserCreated {
                constructor(public user: any) {
                }
            }

            class SendMailUserCreated {
                handle(user: UserCreated) {
                    expect(user).toEqual(new UserCreated({id: 1}));
                }
            }

            app.bind('App/UserCreate', UserCreated);
            app.bind('App/UserCreate2', () => UserCreated);
            app.bind('App/SendMailUserCreated', SendMailUserCreated);

            class EventService extends EventServiceProvider {
                protected listen = [
                    {
                        event: 'App/UserCreate',
                        handlers: [
                            'App/SendMailUserCreated'
                        ]
                    },
                    {
                        event: 'App/UserCreate2',
                        handlers: [
                            'App/SendMailUserCreated'
                        ]
                    }
                ]
            }

            await app.register(new EventService(app));

            Event.emit(UserCreated, new UserCreated({id: 1}))
        });

        it('register listen multiple listener', async () => {
            expect.assertions(2);

            const app = new Application(__dirname);
            const Event = app.use<any>('events');
            const kernel = new GraphQLKernel(app);
            await kernel.handle();

            class UserCreated {
                constructor(public user: any) {
                }
            }

            class SendMailUserCreated {
                handle(user: UserCreated) {
                    expect(user).toEqual(new UserCreated({id: 1}));
                }
            }
            class SendTelegramUserCreated {
                handle(user: UserCreated) {
                    expect(user).toEqual(new UserCreated({id: 1}));
                }
            }


            app.bind('App/UserCreate', UserCreated);
            app.bind('App/SendMailUserCreated', SendMailUserCreated);

            class EventService extends EventServiceProvider {
                protected listen = [
                    {
                        event: 'App/UserCreate',
                        handlers: [
                            'App/SendMailUserCreated',
                            SendTelegramUserCreated
                        ]
                    }
                ]
            }

            await app.register(new EventService(app));

            Event.emit(UserCreated, new UserCreated({id: 1}))
        });
    });
});
