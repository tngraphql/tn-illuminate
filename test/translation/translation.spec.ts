/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/24/2020
 * Time: 2:30 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Application, GraphQLKernel } from '../../src/Foundation';
import { TranslationServiceProvider } from '../../src/Translation/TranslationServiceProvider';
import { Context } from 'tn-graphql/dist/resolvers/context';
import { LocaleUpdated } from '../../src/Foundation/Events/LocaleUpdated';
import { EventServiceProvider } from '../../src/Foundation/Events/EventServiceProvider';

describe('Translation', () => {
    it('regiser translation', async () => {
        const app = new Application();
        const kernel = new GraphQLKernel(app);
        await kernel.handle();
        await app.register(new TranslationServiceProvider(app));
        expect(app.translator).not.toBeNull();
    });

    it('set locale', async () => {
        const app = new Application();
        const kernel = new GraphQLKernel(app);
        await kernel.handle();
        await app.register(new TranslationServiceProvider(app));
        app.setLocale('en');
        expect(app.getLocale()).toBe('en');
        expect(app.getLocale()).toBe(app.translator.getLocale())
        expect(app.getLocale()).toBe(app.translator.locale)
    });

    it('is locale', async () => {
        const app = new Application();
        const kernel = new GraphQLKernel(app);
        await kernel.handle();
        await app.register(new TranslationServiceProvider(app));
        app.setLocale('us');

        expect(app.isLocale('us')).toBeTruthy();
    });

    it('should `context` language locale is [us]', async () => {
        const app = new Application();
        const kernel = new GraphQLKernel(app);
        await kernel.handle();
        await app.register(new TranslationServiceProvider(app));
        app.setLocale('us');

        const context: any = new Context({});

        expect(context.lang.getLocale()).toBe('us');
    });

    it('should `context` language locale is [en]', async () => {
        const app = new Application();
        const kernel = new GraphQLKernel(app);
        await kernel.handle();
        await app.register(new TranslationServiceProvider(app));
        app.setLocale('us');

        const context: any = new Context({req: {headers: {locale: 'en'}}});

        expect(context.lang.getLocale()).toBe('en');
    });

    it('on events change Locale', async (done) => {
        expect.assertions(1);

        const app = new Application();
        const kernel = new GraphQLKernel(app);
        await kernel.handle();
        await app.register(new TranslationServiceProvider(app));
        await app.register(new EventServiceProvider(app));
        app.events.on(LocaleUpdated, (data) => {
            expect(new LocaleUpdated('us')).toEqual(data);
            done()
        });

        app.setLocale('us');
    });
});