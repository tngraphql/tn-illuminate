/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/10/2020
 * Time: 4:57 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Application } from '../src/Foundation/Application';
import { Container } from '../src/Container/Container';
import { join } from 'path';
import { Filesystem } from '@poppinss/dev-utils/build';
import * as path from "path";
import { Service } from '../src/Decorators/Service';
import { Repository } from '../src/config/Repository';
import { requireAll } from '@poppinss/utils/build';
import { Kernel } from '../src/Foundation/Kernel';
import { GraphQLKernel } from '../src/Foundation/GraphQL';

const fs = new Filesystem(join(__dirname, './app'))

describe('Application', () => {
    beforeAll(async () => {
    });
    afterEach(async () => {
        jest.resetModules();
        await fs.cleanup();
    });
    afterAll(async () => {
        await fs.cleanup();
    })

    describe('Singleton pattern', () => {
        it('default', async () => {
            const app = new Application();

            expect(app.getBasePath()).toBe(process.cwd());
            expect(app.configPath()).toBe(process.cwd() + '/config');
            expect(Application.getInstance()).toBe(Container.getInstance());
        });

        it('Make sure that only one version is created', async () => {
            const app = new Application(__dirname);

            expect(app.getBasePath()).toBe(__dirname);
            expect(app.configPath()).toBe(__dirname + '/config');
            expect(Application.getInstance()).toBe(Container.getInstance());
        });

        it('Bind instance', async () => {
            const app = new Application(__dirname);

            expect(app.use(Container)).toEqual(app);
            expect(app.use(Application)).toEqual(app);
        });
    });

    describe('Register', () => {
        let app: Application;
        beforeEach(() => {
            app = new Application(fs.basePath);
        })
        afterEach(async () => {
            app.flush();
        })

        it('register providers', async () => {
            await fs.add('providers/FooProvider.js', `module.exports = class MyProvider {
                constructor () {
                    this.registered = false
                }
                
                register () {
                    this.registered = true
                }
            }`)
            const provider = await app.register(join(fs.basePath, 'providers', 'FooProvider'));
            expect((provider as any).registered).toBe(true);
        })

        it('register an array of providers when defined as es6 modules', async () => {
            await fs.add('providers/BarProvider.ts', `export default class MyProvider {
                public registered = false
                register () {
                    this.registered = true
                }
            }`)

            const provider = await app.register(join(fs.basePath, 'providers', 'BarProvider'));
            expect((provider as any).registered).toBe(true);
        });

        it('register an array of providers when export class', async () => {
            await fs.add('providers/SampleProvider.ts', `export class SampleProvider {
                public registered = false
                register () {
                    this.registered = true
                }
            }`)

            const provider = await app.register(join(fs.basePath, 'providers', 'SampleProvider'));
            expect((provider as any).registered).toBe(true);
        });

        it('register and boot providers together', async () => {
            await fs.add('providers/BarProvider2.ts', `export default class MyProvider2 {
              public registered = false
              public booted = false
        
              register () {
                this.registered = true
              }
        
              async boot () {
                this.booted = true
              }
            }`);
            const provider = await app.register(join(fs.basePath, 'providers', 'BarProvider2'));
            await app.boot();

            expect((provider as any).registered).toBe(true);
            expect((provider as any).booted).toBe(true);
        });

        it('raise exception when provider is not exported as a default export', async () => {
            expect.assertions(2);

            await fs.add('providers/BarProvider3.ts', `export class MyProvider {
              public registered = false
        
              register () {
                this.registered = true
              }
        
              async boot () {
              }
            }`)
            const providerPath = join(fs.basePath, 'providers', 'BarProvider3.ts');
            const provider = await app.register(new (require(providerPath) as any).MyProvider(app));
            expect((provider as any).registered).toBe(true);
            try {
                await app.register(providerPath);
            } catch (e) {
                expect(e.message).toBe( `Make sure export default or export ${path.basename(providerPath)} the provider from ${providerPath}`)
            }
        });

        it('resolve providers from relative path', async () => {
            await fs.add('providers/FooProvider4.js', `module.exports = class MyProvider {
              constructor () {
                this.registered = false
              }
        
              register () {
                this.registered = true
              }
            }`);

            const provider = await app.register('./providers/FooProvider4.js');
            expect((provider as any).registered).toBe(true);
        });

        it('resolve providers from relative path export module', async () => {
            await fs.add('providers/FooProvider5.ts', `export class FooProvider5 {
              constructor () {
                this.registered = false
              }
        
              register () {
                this.registered = true
              }
            }`);

            const provider = await app.register('./providers/FooProvider5.ts');
            expect((provider as any).registered).toBe(true);
        });

        it('resolve providers from relative path export default module', async () => {
            await fs.add('providers/FooProvider6.ts', `export default class FooProvider6 {
              constructor () {
                this.registered = false
              }
        
              register () {
                this.registered = true
              }
            }`);

            const provider = await app.register('./providers/FooProvider6.ts');
            expect((provider as any).registered).toBe(true);
        });
        it('resolve providers from relative path export = module', async () => {
            await fs.add('providers/FooProvider7.ts', `class FooProvider7 {
              constructor () {
                this.registered = false
              }
        
              register () {
                this.registered = true
              }
            }
            export = FooProvider7
            `);

            const provider = await app.register('./providers/FooProvider7.ts');
            expect((provider as any).registered).toBe(true);
        });


        it('let providers define bindings', async () => {
            await fs.add('providers/BindingProvider.ts', `
            class A{}
            class B{}
            
            module.exports = class MyProvider {
              constructor () {
                this.registered = false;
                this.bindings = [
                    A,
                    ['foo', A]
                ];
                this.singletons = [
                    B,
                    ['bar',B]
                ];
              }
        
              register () {
                this.registered = true
              }
            }
            `);

            const provider = await app.register('./providers/BindingProvider.ts');
            expect((provider as any).registered).toBe(true);
            expect(app.use('foo')).toEqual({});
            expect(app.use('bar')).toEqual({});
        });
    });

    describe('App | instance', () => {
        let app: Application;
        beforeEach(() => {
            app = new Application(fs.basePath);
        })
        afterEach(async () => {
            app.flush();
        })

        it('instance', async () => {
            app.instance('test', new (class {
                register = true;
            }));

            expect(app.test.register).toBe(true);
        });

        it('instance config', async () => {
            await fs.add('config/app.ts', `
                export default {
                    name: 'test'
                }
            `);

            app.instance('config', new Repository(requireAll(app.configPath())));

            expect(app.config).toEqual({ config: { app: { name: 'test' } } });
            expect(app.config.get('app.name')).toEqual('test');
        });

        it('register config providers', async () => {
            class MyProvider {
                registered: boolean;

                constructor () {
                    this.registered = false;
                }

                register () {
                    this.registered = true
                }
            }
            app.instance('config', new Repository({
                app: {
                    providers: [
                        MyProvider
                    ]
                }
            }));

            await app.registerConfiguredProviders();

            expect(app.getServiceProviders().find(x => x instanceof MyProvider).registered).toBe(true);
        });

        it('Regiser config provider from relative path', async () => {
            await fs.add('providers/MyProvider22.ts', `
            module.exports = class MyProvider {
              constructor () {
                this.registered = false;
              }
        
              register () {
                this.registered = true
              }
            }
            `);
            app.instance('config', new Repository({
                app: {
                    providers: [
                        './providers/MyProvider22.ts'
                    ]
                }
            }));

            await app.registerConfiguredProviders();

            expect(app.getServiceProviders().find(x => x.constructor.name === 'MyProvider').registered).toBe(true);
        });
    });

    describe('App | Make', () => {
        let app: Application;
        beforeEach(() => {
            app = new Application(fs.basePath);
        })
        afterEach(async () => {
            jest.resetModules();
            await fs.cleanup();
            app.flush();
        })

        it('Make resolve', async () => {
            class Bar{}

            @Service()
            class Foo {
                constructor(public bar: Bar) {
                }
            }

            expect(await app.make<Foo>(Foo, [], false).bar).toEqual(new Bar());
        });
        it('Make Kernel', async () => {
            await fs.add('config/app.ts', `
                export default {
                    name: 'test',
                    providers: []
                }
            `);

            await app.make<Kernel>(Kernel).handle();

            expect(app.config.get('app.name')).toEqual('test');
        });
        it('Make kernel register providers', async () => {
            await fs.add('config/app.ts', `
                class MyProvider {
                  constructor () {
                    this.registered = false;
                  }
            
                  register () {
                    this.registered = true
                  }
                }
                export default {
                    name: 'test',
                    providers: [MyProvider]
                }
            `);

            await app.make<Kernel>(Kernel).handle();

            expect(app.config.get('app.name')).toEqual('test');
        });
        it('Make kernel register providers from relative path', async () => {
            await fs.add('providers/MyProvider.ts', `
            module.exports = class MyProvider {
              constructor () {
                this.registered = false;
              }
        
              register () {
                this.registered = true
              }
            }
            `);

            await fs.add('config/app.ts', `
                class MyProvider {
                  constructor () {
                    this.registered = false;
                  }
            
                  register () {
                    this.registered = true
                  }
                }
                export default {
                    name: 'test',
                    providers: ['./providers/MyProvider.ts']
                }
            `);

            await app.make<Kernel>(Kernel).handle();

            expect(app.config.get('app.name')).toEqual('test');
        });

    });

    describe('App | EnvironmentVariables', () => {
        it('default Environment', async () => {
            const app = new Application(fs.basePath);

            expect(app.environmentFilePath()).toBe(path.join(process.cwd(), '.env'));
        });

        it('load environment file', async () => {
            const app = new Application(fs.basePath);
            app.loadEnvironmentFrom('.env.testing');
            expect(app.environmentFile()).toBe('.env.testing');
            expect(app.environmentFilePath()).toBe(path.join(process.cwd(), '.env.testing'));
        });

        it('use environment path', async () => {
            const app = new Application(fs.basePath);
            app.useEnvironmentPath(app.basePath());
            expect(app.environmentFilePath()).toBe(path.join(app.basePath(), app.environmentFile()));
        });

        it('load environment default', async () => {
            const app = new Application(fs.basePath);
            const kernel = new GraphQLKernel(app);
            await kernel.handle();

            const {Env} = require('../src/Support/Env');
            expect(Env.get('APP_NAME')).toBe('illuminate');
        });

        it('load enviroment file', async () => {
            const app = new Application(fs.basePath);
            app.loadEnvironmentFrom('.env.testing')
            const kernel = new GraphQLKernel(app);
            await kernel.handle();

            const {Env} = require('../src/Support/Env');

            expect(Env.get('APP_NAME')).toBe('testing');
        });
        it('load use environment path', async () => {
            await fs.add('.env', `APP_NAME=path`)
            const app = new Application(fs.basePath);
            app.useEnvironmentPath(app.basePath());
            const kernel = new GraphQLKernel(app);
            await kernel.handle();

            const {Env} = require('../src/Support/Env');
            expect(Env.get('APP_NAME')).toBe('path');
            await fs.remove('.env');
        });

    });
});
