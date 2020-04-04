/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/9/2020
 * Time: 10:48 PM
 */
import { ServiceProvider } from '../../src/Support/ServiceProvider';
import { Service } from '../../src/Decorators/Service';

export class TestService extends ServiceProvider {
    boot() {
        this.mergeConfigFrom(__dirname + '/db', 'db');
    }
}

