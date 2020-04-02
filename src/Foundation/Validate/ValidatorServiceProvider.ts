/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/19/2020
 * Time: 1:23 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { ServiceProvider } from '../../Support/ServiceProvider';
import { Factory } from './Factory';
import { DatabasePresenceVerifier } from './DatabasePresenceVerifier';

export class ValidatorServiceProvider extends ServiceProvider{

    register() {
        this.registerPresenceVerifier();

        this.registerValidationFactory();
    }

    registerValidationFactory() {
        this.app.singleton('validator', () => {
            const validator = new Factory(this.app);

            if ( this.app.hasBinding('db') && this.app.hasBinding('validation.presence') ) {
                validator.setPresenceVerifier(this.app.use('validation.presence'));
            }

            return validator;
        });
    }

    registerPresenceVerifier() {
        this.app.singleton('validation.presence', () => {
            return new DatabasePresenceVerifier(this.app.use('db'));
        });
    }
}
