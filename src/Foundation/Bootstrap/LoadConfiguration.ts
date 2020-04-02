/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/10/2020
 * Time: 2:10 PM
 */
import { Application } from '../Application';
import { Repository } from '../../config/Repository';
import { requireAll } from '@poppinss/utils/build';

export class LoadConfiguration {
    public bootstrap(app: Application) {
        try {
            const config = new Repository(requireAll(app.configPath()));

            app.instance('config', config);
        } catch (e) {
            const config = new Repository({});

            app.instance('config', config);
        }
    }
}