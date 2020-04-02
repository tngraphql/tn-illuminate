/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/9/2020
 * Time: 9:50 PM
 */
import { mergeWith } from 'lodash';
import { Service } from '../Decorators/Service';
import { esmRequire } from '@poppinss/utils/build';
import { AceApplication } from '../Foundation/Console/AceApplication';
import { Application } from '../Foundation/Application';

@Service()
export class ServiceProvider {
    /**
     * Create a new service provider instance.
     * @param app
     */
    constructor(protected app: Application) {
    }

    register() {
        //
    }

    boot() {
        //
    }

    protected mergeConfigFrom(path: string, key: string) {
        const config = this.app['config'].get(key, {});

        this.app['config'].set(key, mergeWith(esmRequire(path), config))
    }

    /**
     * Register the package's custom Artisan commands.
     */
    public commands(commands: any[]) {
        AceApplication.starting(ace => {
            ace.register(commands);
        })
    }
}