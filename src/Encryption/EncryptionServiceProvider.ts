/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 8/31/2020
 * Time: 7:16 AM
 */
import {Service, ServiceProvider} from "..";
import {Encrypter} from "./Encrypter";

@Service()
export class EncryptionServiceProvider extends ServiceProvider {
    /**
     * Register the service provider.
     *
     */
    public register() {
        this.app.singleton('encrypter', () => {
            const config = this.app.make('config').get('app');

            let key: any = this.key(config);

            if (key.startsWith('base64:')) {
                key = Buffer.from(key.substr(7), 'base64');
            }

            return new Encrypter(key, config.cipher);
        });
    }

    /**
     * Extract the encryption key from the given configuration.
     *
     * @param config
     */
    protected key(config: any): string {
        const key = config.key;

        if (!key) {
            throw new Error('No application encryption key has been specified.');
        }

        return key;
    }
}