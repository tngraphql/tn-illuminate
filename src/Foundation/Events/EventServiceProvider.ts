/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/15/2020
 * Time: 3:39 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { Emitter } from '@adonisjs/events/build/standalone';
import { EmitterContract } from '../../Contracts/Events/EmitterContract';
import { Service } from '../../Decorators/Service';
import { Application } from '../Application';
import { Emittery } from './Emittery';

@Service()
export class EventServiceProvider {
    /**
     * Create a new service provider instance.
     * @param app
     */
    constructor(protected app: Application) {
    }

    register() {
        this.app.singleton('events', () => {
            const emitter: EmitterContract = new Emitter(this.app) as any;
            emitter.transport = new Emittery() as any;
            return emitter;
        });

        this.app.getter('events', function () {
            return this.use('events');
        });
    }
}
