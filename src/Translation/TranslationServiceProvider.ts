/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/24/2020
 * Time: 12:55 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { ServiceProvider } from '../Support/ServiceProvider';
import * as path from "path";
import { Context } from '@tngraphql/graphql/dist/resolvers/context';

export class TranslationServiceProvider extends ServiceProvider{
    register() {
        this.app.singleton('translator', () => {
            const i18n = require('i18n');

            this.mergeConfigFrom(path.join(__dirname, '../config/i18n'), 'i18n');

            i18n.configure(this.app.config.get('i18n'));

            const req = {};

            const res: any = {};

            i18n.init(req, res);

            res.t = res.__;

            return res;
        });
    }

    boot() {
        const self = this.app;
        Context.getter('lang', function() {
            const translator: any = self.use('translator');
            try {
                self.setLocale(this.req.headers.locale);
            } catch (e) {

            }
            return translator;
        });
    }
}
