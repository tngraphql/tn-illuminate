import { Application } from '../Application';
import { Env } from '../../Support/Env';
import { envLoader } from '../../Support/EnvLoader';
import { Env as EnvFactory } from '@adonisjs/env/build/src/Env';

/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/10/2020
 * Time: 2:26 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const dotenv = require('dotenv');

export class LoadEnvironmentVariables {
    public bootstrap(app: Application) {
        try {
            this.createDotenv(app);
        } catch (e) {
            throw e;
            // console.log(e);
        }
    }

    createDotenv(app) {
        Env.setFactory(new EnvFactory());
        const { envContents, testEnvContent } = envLoader(app.environmentFilePath());
        const env = Env.getFactory();
        env.process(envContents, true);
        env.process(testEnvContent, true);
    }
}
