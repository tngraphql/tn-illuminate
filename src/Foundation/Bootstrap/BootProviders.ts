import { Application } from '../Application';

/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/10/2020
 * Time: 2:19 PM
 */

export class BootProviders {
    public async bootstrap(app: Application) {
        await app.boot();
    }
}