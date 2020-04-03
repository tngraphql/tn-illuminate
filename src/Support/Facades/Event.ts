import { Facade } from '../Facade';
import { EmitterContract } from '../../Contracts/Events/EmitterContract';
import { FakeEmitter } from '@adonisjs/events/build/src/FakeEmitter';

/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/15/2020
 * Time: 3:42 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
export const Event = Facade.create<FakeEmitter<EmitterContract>  & {
    fake: () => void
}>('events', {
    fake: function() {
        const fake = new FakeEmitter(this.app);

        this.swap('events', fake);

        return fake;
    }
});
